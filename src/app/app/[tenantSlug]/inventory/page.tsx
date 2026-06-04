import React from 'react'
import { getInventoryItems, getInventoryCategories } from '@/app/actions/inventory'
import InventoryClient from './InventoryClient'
import { getTenantContext } from '@/lib/getTenantContext'

interface PageProps {
  searchParams: {
    category?: string
    q?: string
    filter?: string
  }
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const categoryFilter = resolvedSearchParams?.category || ''
  const query = resolvedSearchParams?.q || ''
  const filterType = resolvedSearchParams?.filter || '' // e.g. "low"

  let items = await getInventoryItems({
    category: categoryFilter,
    query,
  })

  // Filter low stock if specified
  if (filterType === 'low') {
    items = items.filter((item) => item.quantity <= item.minStockLevel)
  }

  const categories = await getInventoryCategories()
  const { tenantSlug, userRole } = await getTenantContext()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Parts Inventory</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor spare parts levels, record restocks, configure automatic minimum levels, and track supplier metadata.
        </p>
      </div>

      <InventoryClient
        initialItems={items}
        categories={categories}
        tenantSlug={tenantSlug}
        userRole={userRole}
        filterType={filterType}
      />
    </div>
  )
}
