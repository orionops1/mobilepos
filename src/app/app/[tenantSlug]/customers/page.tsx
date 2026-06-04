import React from 'react'
import { getCustomers } from '@/app/actions/customers'
import CustomersClient from './CustomersClient'
import { getTenantContext } from '@/lib/getTenantContext'

interface PageProps {
  searchParams: {
    q?: string
  }
}

export default async function CustomersPage({ searchParams }: PageProps) {
  // Await the searchParams as required in Next.js 15
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams?.q || ''
  
  const customers = await getCustomers(query)
  const { tenantSlug } = await getTenantContext()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Customer Database</h1>
        <p className="text-sm text-slate-400 mt-1">
          Add new clients, search history, and track previous repair job sheets.
        </p>
      </div>

      <CustomersClient initialCustomers={customers} tenantSlug={tenantSlug} />
    </div>
  )
}
