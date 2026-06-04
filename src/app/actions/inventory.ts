'use server'

import { db } from '@/lib/db'
import { getTenantContext } from '@/lib/getTenantContext'
import { StockTransactionType } from '@prisma/client'

export async function getInventoryItems(filters?: { category?: string; query?: string }) {
  const { tenantId } = await getTenantContext()

  return db.inventoryItem.findMany({
    where: {
      tenantId,
      ...(filters?.category ? { category: filters.category } : {}),
      ...(filters?.query
        ? {
            OR: [
              { name: { contains: filters.query, mode: 'insensitive' } },
              { sku: { contains: filters.query, mode: 'insensitive' } },
              { category: { contains: filters.query, mode: 'insensitive' } },
              { supplierName: { contains: filters.query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { name: 'asc' },
  })
}

export async function createInventoryItem(data: {
  name: string
  sku?: string
  category: string
  quantity: number
  minStockLevel: number
  purchaseCost: number
  sellingPrice: number
  supplierName?: string
  supplierContact?: string
}) {
  const { tenantId, userId } = await getTenantContext()

  // Generate unique SKU if not provided
  const sku = data.sku?.trim() || `SKU-${Date.now()}`

  // Check if SKU exists
  const existing = await db.inventoryItem.findFirst({
    where: { tenantId, sku },
  })
  if (existing) {
    throw new Error(`An item with SKU "${sku}" already exists.`)
  }

  const item = await db.inventoryItem.create({
    data: {
      name: data.name,
      sku,
      category: data.category,
      quantity: data.quantity,
      minStockLevel: data.minStockLevel,
      purchaseCost: data.purchaseCost,
      sellingPrice: data.sellingPrice,
      supplierName: data.supplierName || null,
      supplierContact: data.supplierContact || null,
      tenantId,
    },
  })

  // Log initial stock transaction if quantity > 0
  if (data.quantity > 0) {
    await db.stockTransaction.create({
      data: {
        itemId: item.id,
        type: 'STOCK_IN',
        quantity: data.quantity,
        note: 'Initial stock intake',
        userId,
      },
    })
  }

  await db.auditLog.create({
    data: {
      tenantId,
      userId,
      action: 'CREATE_INVENTORY',
      details: `Added new stock item: ${item.name} (${item.sku}). Initial Qty: ${item.quantity}`,
    },
  })

  return item
}

export async function updateInventoryItem(
  id: string,
  data: {
    name: string
    sku?: string
    category: string
    minStockLevel: number
    purchaseCost: number
    sellingPrice: number
    supplierName?: string
    supplierContact?: string
  }
) {
  const { tenantId, userId } = await getTenantContext()

  const existing = await db.inventoryItem.findFirst({
    where: { id, tenantId },
  })
  if (!existing) throw new Error('Inventory item not found')

  const sku = data.sku?.trim() || existing.sku

  // Check SKU uniqueness if changed
  if (sku !== existing.sku) {
    const duplicate = await db.inventoryItem.findFirst({
      where: { tenantId, sku, id: { not: id } },
    })
    if (duplicate) {
      throw new Error(`An item with SKU "${sku}" already exists.`)
    }
  }

  const updated = await db.inventoryItem.update({
    where: { id },
    data: {
      name: data.name,
      sku,
      category: data.category,
      minStockLevel: data.minStockLevel,
      purchaseCost: data.purchaseCost,
      sellingPrice: data.sellingPrice,
      supplierName: data.supplierName || null,
      supplierContact: data.supplierContact || null,
    },
  })

  await db.auditLog.create({
    data: {
      tenantId,
      userId,
      action: 'UPDATE_INVENTORY',
      details: `Updated stock item details: ${updated.name} (${updated.sku})`,
    },
  })

  return updated
}

export async function adjustStock(
  id: string,
  type: StockTransactionType,
  quantity: number,
  note?: string
) {
  const { tenantId, userId } = await getTenantContext()

  const item = await db.inventoryItem.findFirst({
    where: { id, tenantId },
  })
  if (!item) throw new Error('Inventory item not found')

  if (quantity <= 0) throw new Error('Quantity must be greater than zero')

  let newQuantity = item.quantity
  if (type === 'STOCK_IN') {
    newQuantity += quantity
  } else {
    if (item.quantity < quantity) {
      throw new Error(`Insufficient stock. Current: ${item.quantity}, Attempted deduction: ${quantity}`)
    }
    newQuantity -= quantity
  }

  const updated = await db.inventoryItem.update({
    where: { id },
    data: { quantity: newQuantity },
  })

  await db.stockTransaction.create({
    data: {
      itemId: id,
      type,
      quantity,
      note: note || `Manual stock adjustment (${type})`,
      userId,
    },
  })

  await db.auditLog.create({
    data: {
      tenantId,
      userId,
      action: type === 'STOCK_IN' ? 'STOCK_IN' : 'STOCK_OUT',
      details: `Adjusted stock of ${item.name} (${item.sku}). Change: ${type === 'STOCK_IN' ? '+' : '-'}${quantity}. New Qty: ${newQuantity}`,
    },
  })

  return updated
}

export async function getLowStockItems() {
  const { tenantId } = await getTenantContext()

  return db.inventoryItem.findMany({
    where: {
      tenantId,
      quantity: {
        lte: db.inventoryItem.fields.minStockLevel,
      },
    },
    orderBy: { quantity: 'asc' },
  })
}

export async function getInventoryCategories() {
  const { tenantId } = await getTenantContext()

  const categories = await db.inventoryItem.findMany({
    where: { tenantId },
    select: { category: true },
    distinct: ['category'],
  })

  return categories.map((c) => c.category)
}
