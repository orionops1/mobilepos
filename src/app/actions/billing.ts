'use server'

import { db } from '@/lib/db'
import { getTenantContext } from '@/lib/getTenantContext'
import { InvoiceStatus } from '@prisma/client'

export async function getInvoices(filters?: {
  query?: string
  status?: InvoiceStatus
  startDate?: string
  endDate?: string
}) {
  const { tenantId } = await getTenantContext()

  const start = filters?.startDate ? new Date(filters.startDate) : undefined
  const end = filters?.endDate ? new Date(filters.endDate) : undefined
  if (end) {
    end.setHours(23, 59, 59, 999) // include whole end day
  }

  return db.invoice.findMany({
    where: {
      tenantId,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(start || end
        ? {
            createdAt: {
              ...(start ? { gte: start } : {}),
              ...(end ? { lte: end } : {}),
            },
          }
        : {}),
      ...(filters?.query
        ? {
            OR: [
              { invoiceNo: { contains: filters.query, mode: 'insensitive' } },
              {
                customer: {
                  OR: [
                    { name: { contains: filters.query, mode: 'insensitive' } },
                    { mobile: { contains: filters.query } },
                  ],
                },
              },
            ],
          }
        : {}),
    },
    include: {
      customer: true,
      jobCard: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getInvoiceById(id: string) {
  const { tenantId } = await getTenantContext()

  return db.invoice.findFirst({
    where: { id, tenantId },
    include: {
      customer: true,
      jobCard: true,
      items: {
        include: {
          item: true,
        },
      },
      editLogs: {
        orderBy: { createdAt: 'desc' },
      },
      tenant: true,
    },
  })
}

export async function createInvoice(data: {
  customerId: string
  jobCardId?: string
  items: {
    description: string
    itemId?: string // Link to inventory spare part
    quantity: number
    unitPrice: number
  }[]
  discount: number
  taxRate: number
  amountPaid: number
  status: InvoiceStatus
}) {
  const { tenantId, userId, userName } = await getTenantContext()

  if (data.items.length === 0) {
    throw new Error('Invoice must contain at least one item.')
  }

  // Calculate totals
  let subtotal = 0
  for (const item of data.items) {
    subtotal += item.quantity * item.unitPrice
  }

  const discountAmount = data.discount
  const netAmount = Math.max(0, subtotal - discountAmount)
  const taxAmount = (netAmount * data.taxRate) / 100
  const grandTotal = netAmount + taxAmount

  // Generate visual invoice number
  const count = await db.invoice.count({ where: { tenantId } })
  const invoiceNo = `INV-${1001 + count}`

  // Database Transaction to ensure Invoice creation and Stock subtraction succeed together
  const invoice = await db.$transaction(async (tx) => {
    // 1. Create Invoice
    const inv = await tx.invoice.create({
      data: {
        invoiceNo,
        tenantId,
        customerId: data.customerId,
        jobCardId: data.jobCardId || null,
        subtotal,
        discount: data.discount,
        taxRate: data.taxRate,
        taxAmount,
        grandTotal,
        amountPaid: data.amountPaid,
        status: data.status,
      },
    })

    // 2. Add items and deduct stock
    for (const item of data.items) {
      const totalPrice = item.quantity * item.unitPrice
      
      await tx.invoiceItem.create({
        data: {
          invoiceId: inv.id,
          description: item.description,
          itemId: item.itemId || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice,
        },
      })

      // If linked to inventory, subtract quantity
      if (item.itemId) {
        const inventoryItem = await tx.inventoryItem.findFirst({
          where: { id: item.itemId, tenantId },
        })

        if (!inventoryItem) {
          throw new Error(`Inventory item for "${item.description}" not found.`)
        }

        if (inventoryItem.quantity < item.quantity) {
          throw new Error(`Insufficient stock for "${inventoryItem.name}". Available: ${inventoryItem.quantity}, Needed: ${item.quantity}`)
        }

        // Deduct
        await tx.inventoryItem.update({
          where: { id: item.itemId },
          data: {
            quantity: { decrement: item.quantity },
          },
        })

        // Log Stock transaction
        await tx.stockTransaction.create({
          data: {
            itemId: item.itemId,
            type: 'STOCK_OUT',
            quantity: item.quantity,
            note: `Sold in Invoice #${invoiceNo}`,
            userId,
          },
        })
      }
    }

    // If there is an associated Job Card, update its status to DELIVERED if paid, or just link it
    if (data.jobCardId) {
      await tx.jobCard.update({
        where: { id: data.jobCardId },
        data: {
          status: data.status === 'PAID' ? 'DELIVERED' : 'READY',
        },
      })
    }

    return inv
  })

  await db.auditLog.create({
    data: {
      tenantId,
      userId,
      action: 'CREATE_INVOICE',
      details: `Generated Invoice: ${invoiceNo}. Amount: ₹${grandTotal.toFixed(2)}. Status: ${data.status}`,
    },
  })

  return invoice
}

export async function updateInvoice(
  id: string,
  data: {
    items: {
      id?: string // Exists if editing existing item
      description: string
      itemId?: string
      quantity: number
      unitPrice: number
    }[]
    discount: number
    taxRate: number
    amountPaid: number
    status: InvoiceStatus
  }
) {
  const { tenantId, userId, userName } = await getTenantContext()

  const existingInvoice = await db.invoice.findFirst({
    where: { id, tenantId },
    include: { items: true },
  })

  if (!existingInvoice) throw new Error('Invoice not found')
  if (existingInvoice.status === 'CANCELLED') {
    throw new Error('Cancelled invoices cannot be edited.')
  }

  // Calculate totals
  let subtotal = 0
  for (const item of data.items) {
    subtotal += item.quantity * item.unitPrice
  }

  const discountAmount = data.discount
  const netAmount = Math.max(0, subtotal - discountAmount)
  const taxAmount = (netAmount * data.taxRate) / 100
  const grandTotal = netAmount + taxAmount

  await db.$transaction(async (tx) => {
    // 1. Revert previous stock changes from original items
    for (const originalItem of existingInvoice.items) {
      if (originalItem.itemId) {
        await tx.inventoryItem.update({
          where: { id: originalItem.itemId },
          data: {
            quantity: { increment: originalItem.quantity },
          },
        })
        await tx.stockTransaction.create({
          data: {
            itemId: originalItem.itemId,
            type: 'STOCK_IN',
            quantity: originalItem.quantity,
            note: `Reverted for editing Invoice #${existingInvoice.invoiceNo}`,
            userId,
          },
        })
      }
    }

    // 2. Delete existing items from database
    await tx.invoiceItem.deleteMany({
      where: { invoiceId: id },
    })

    // 3. Update Invoice info
    await tx.invoice.update({
      where: { id },
      data: {
        subtotal,
        discount: data.discount,
        taxRate: data.taxRate,
        taxAmount,
        grandTotal,
        amountPaid: data.amountPaid,
        status: data.status,
      },
    })

    // 4. Create new items and apply new stock subtraction
    for (const item of data.items) {
      const totalPrice = item.quantity * item.unitPrice
      await tx.invoiceItem.create({
        data: {
          invoiceId: id,
          description: item.description,
          itemId: item.itemId || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice,
        },
      })

      if (item.itemId) {
        const inventoryItem = await tx.inventoryItem.findFirst({
          where: { id: item.itemId },
        })

        if (!inventoryItem || inventoryItem.quantity < item.quantity) {
          throw new Error(`Insufficient stock for "${item.description}".`)
        }

        await tx.inventoryItem.update({
          where: { id: item.itemId },
          data: { quantity: { decrement: item.quantity } },
        })

        await tx.stockTransaction.create({
          data: {
            itemId: item.itemId,
            type: 'STOCK_OUT',
            quantity: item.quantity,
            note: `Sold in updated Invoice #${existingInvoice.invoiceNo}`,
            userId,
          },
        })
      }
    }

    // 5. Create edit history log
    await tx.invoiceEditLog.create({
      data: {
        invoiceId: id,
        changedBy: userName || 'System',
        details: `Updated invoice totals. New total: ₹${grandTotal.toFixed(2)}. Status: ${data.status}`,
      },
    })
  })

  await db.auditLog.create({
    data: {
      tenantId,
      userId,
      action: 'UPDATE_INVOICE',
      details: `Modified Invoice: ${existingInvoice.invoiceNo}`,
    },
  })

  return { success: true }
}

export async function cancelInvoice(id: string) {
  const { tenantId, userId, userName } = await getTenantContext()

  const invoice = await db.invoice.findFirst({
    where: { id, tenantId },
    include: { items: true },
  })

  if (!invoice) throw new Error('Invoice not found')
  if (invoice.status === 'CANCELLED') throw new Error('Invoice is already cancelled.')

  await db.$transaction(async (tx) => {
    // 1. Revert stock
    for (const item of invoice.items) {
      if (item.itemId) {
        await tx.inventoryItem.update({
          where: { id: item.itemId },
          data: {
            quantity: { increment: item.quantity },
          },
        })

        await tx.stockTransaction.create({
          data: {
            itemId: item.itemId,
            type: 'STOCK_IN',
            quantity: item.quantity,
            note: `Reverted due to cancellation of Invoice #${invoice.invoiceNo}`,
            userId,
          },
        })
      }
    }

    // 2. Set status to CANCELLED
    await tx.invoice.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    })

    // 3. Log to history
    await tx.invoiceEditLog.create({
      data: {
        invoiceId: id,
        changedBy: userName || 'System',
        details: `Cancelled invoice and restored related inventory stock.`,
      },
    })
  })

  await db.auditLog.create({
    data: {
      tenantId,
      userId,
      action: 'CANCEL_INVOICE',
      details: `Cancelled Invoice: ${invoice.invoiceNo}`,
    },
  })

  return { success: true }
}

export async function updateBusinessSettings(data: {
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
  taxNumber?: string
  currency?: string
  taxRate?: number
  qrCodeData?: string
  logoUrl?: string
}) {
  const { tenantId, userId, userRole } = await getTenantContext()

  if (userRole !== 'OWNER' && userRole !== 'MANAGER') {
    throw new Error('Unauthorized: Only Owners or Managers can update shop settings.')
  }

  const updatedTenant = await db.tenant.update({
    where: { id: tenantId },
    data: {
      name: data.name,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      taxNumber: data.taxNumber || null,
      currency: data.currency || 'INR',
      taxRate: data.taxRate !== undefined ? data.taxRate : 0.00,
      qrCodeData: data.qrCodeData || null,
      logoUrl: data.logoUrl || null,
    },
  })

  await db.auditLog.create({
    data: {
      tenantId,
      userId,
      action: 'UPDATE_SETTINGS',
      details: `Updated business/shop parameters for: ${updatedTenant.name}`,
    },
  })

  return updatedTenant
}

export async function getBusinessSettings() {
  const { tenantId } = await getTenantContext()

  return db.tenant.findUnique({
    where: { id: tenantId },
  })
}
