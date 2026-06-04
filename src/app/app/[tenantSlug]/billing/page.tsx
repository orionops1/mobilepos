import React from 'react'
import { getInvoices, getBusinessSettings } from '@/app/actions/billing'
import { getCustomers } from '@/app/actions/customers'
import { getJobCards } from '@/app/actions/repairs'
import { getInventoryItems } from '@/app/actions/inventory'
import BillingClient from './BillingClient'
import { getTenantContext } from '@/lib/getTenantContext'
import { InvoiceStatus } from '@prisma/client'

interface PageProps {
  searchParams: {
    status?: string
    q?: string
    startDate?: string
    endDate?: string
    action?: string
    job?: string
  }
}

export default async function BillingPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const statusFilter = resolvedSearchParams?.status as InvoiceStatus | undefined
  const query = resolvedSearchParams?.q || ''
  const startDate = resolvedSearchParams?.startDate || ''
  const endDate = resolvedSearchParams?.endDate || ''
  const openAction = resolvedSearchParams?.action || ''
  const linkJobId = resolvedSearchParams?.job || ''

  const invoices = await getInvoices({
    query,
    status: statusFilter,
    startDate,
    endDate,
  })
  
  const customers = await getCustomers()
  const inventoryItems = await getInventoryItems()
  const tenantSettings = await getBusinessSettings()
  
  // Fetch ready repairs that can be linked
  const readyRepairs = await getJobCards({ status: 'READY' })
  
  const { tenantSlug, userRole } = await getTenantContext()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Billing & Invoices</h1>
        <p className="text-sm text-slate-400 mt-1">
          Generate bills for repairs and accessory sales, customize print sizes, and track cash collections.
        </p>
      </div>

      <BillingClient
        initialInvoices={invoices}
        customers={customers}
        inventoryItems={inventoryItems}
        readyRepairs={readyRepairs}
        tenantSettings={tenantSettings}
        tenantSlug={tenantSlug}
        userRole={userRole}
        openAction={openAction}
        linkJobId={linkJobId}
      />
    </div>
  )
}
