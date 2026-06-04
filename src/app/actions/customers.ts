'use server'

import { db } from '@/lib/db'
import { getTenantContext } from '@/lib/getTenantContext'
import { revalidatePath } from 'next/cache'

export async function getCustomers(query?: string) {
  const { tenantId } = await getTenantContext()

  return db.customer.findMany({
    where: {
      tenantId,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { mobile: { contains: query } },
              { alternateMobile: { contains: query } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getCustomerById(id: string) {
  const { tenantId } = await getTenantContext()

  return db.customer.findFirst({
    where: { id, tenantId },
    include: {
      jobCards: {
        orderBy: { createdAt: 'desc' },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function createCustomer(data: {
  name: string
  mobile: string
  alternateMobile?: string
  email?: string
  address?: string
  notes?: string
}) {
  const { tenantId } = await getTenantContext()

  // Clean values
  const cleanMobile = data.mobile.trim()
  if (!cleanMobile) throw new Error('Mobile number is required')

  // Check if mobile already exists for this tenant
  const existing = await db.customer.findFirst({
    where: {
      tenantId,
      mobile: cleanMobile,
    },
  })

  if (existing) {
    throw new Error('A customer with this mobile number already exists.')
  }

  const customer = await db.customer.create({
    data: {
      name: data.name,
      mobile: cleanMobile,
      alternateMobile: data.alternateMobile || null,
      email: data.email || null,
      address: data.address || null,
      notes: data.notes || null,
      tenantId,
    },
  })

  // Log action
  await db.auditLog.create({
    data: {
      tenantId,
      action: 'CREATE_CUSTOMER',
      details: `Created customer: ${customer.name} (${customer.mobile})`,
    },
  })

  return customer
}

export async function updateCustomer(
  id: string,
  data: {
    name: string
    mobile: string
    alternateMobile?: string
    email?: string
    address?: string
    notes?: string
  }
) {
  const { tenantId } = await getTenantContext()

  const cleanMobile = data.mobile.trim()

  // Verify ownership
  const customer = await db.customer.findFirst({
    where: { id, tenantId },
  })
  if (!customer) throw new Error('Customer not found')

  // Verify mobile uniqueness if changed
  if (cleanMobile !== customer.mobile) {
    const existing = await db.customer.findFirst({
      where: {
        tenantId,
        mobile: cleanMobile,
        id: { not: id },
      },
    })
    if (existing) {
      throw new Error('A customer with this mobile number already exists.')
    }
  }

  const updated = await db.customer.update({
    where: { id },
    data: {
      name: data.name,
      mobile: cleanMobile,
      alternateMobile: data.alternateMobile || null,
      email: data.email || null,
      address: data.address || null,
      notes: data.notes || null,
    },
  })

  await db.auditLog.create({
    data: {
      tenantId,
      action: 'UPDATE_CUSTOMER',
      details: `Updated customer ID: ${id}. Changed mobile from ${customer.mobile} to ${cleanMobile}`,
    },
  })

  return updated
}

export async function deleteCustomer(id: string) {
  const { tenantId, userRole } = await getTenantContext()

  // Only OWNER or MANAGER can delete customers
  if (userRole !== 'OWNER' && userRole !== 'MANAGER') {
    throw new Error('Unauthorized: Only Owners or Managers can delete customers.')
  }

  // Check if customer exists
  const customer = await db.customer.findFirst({
    where: { id, tenantId },
  })
  if (!customer) throw new Error('Customer not found')

  // Delete
  await db.customer.delete({
    where: { id },
  })

  await db.auditLog.create({
    data: {
      tenantId,
      action: 'DELETE_CUSTOMER',
      details: `Deleted customer: ${customer.name} (${customer.mobile})`,
    },
  })

  return { success: true }
}
