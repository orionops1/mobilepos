import React from 'react'
import { getJobCards, getTechnicians } from '@/app/actions/repairs'
import { getCustomers } from '@/app/actions/customers'
import RepairsClient from './RepairsClient'
import { getTenantContext } from '@/lib/getTenantContext'
import { JobStatus } from '@prisma/client'

interface PageProps {
  searchParams: {
    status?: string
    q?: string
    action?: string
  }
}

export default async function RepairsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const statusFilter = resolvedSearchParams?.status as JobStatus | undefined
  const query = resolvedSearchParams?.q || ''
  const openAction = resolvedSearchParams?.action || ''

  const jobCards = await getJobCards({ status: statusFilter, query })
  const customers = await getCustomers()
  const technicians = await getTechnicians()
  const { tenantSlug, userRole } = await getTenantContext()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Repair Workstation</h1>
        <p className="text-sm text-slate-400 mt-1">
          Intake devices, assign technicians, track repair lifecycles, and write diagnostic notes.
        </p>
      </div>

      <RepairsClient
        initialJobCards={jobCards}
        customers={customers}
        technicians={technicians}
        tenantSlug={tenantSlug}
        userRole={userRole}
        openAction={openAction}
      />
    </div>
  )
}
