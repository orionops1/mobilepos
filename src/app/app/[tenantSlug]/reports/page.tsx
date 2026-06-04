import React from 'react'
import { getSalesReport, getTechnicianPerformanceReport, getAuditLogs } from '@/app/actions/reports'
import ReportsClient from './ReportsClient'
import { getTenantContext } from '@/lib/getTenantContext'

interface PageProps {
  searchParams: {
    startDate?: string
    endDate?: string
  }
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const startDate = resolvedSearchParams?.startDate || ''
  const endDate = resolvedSearchParams?.endDate || ''

  const salesReport = await getSalesReport(startDate, endDate)
  const techReport = await getTechnicianPerformanceReport()
  const auditLogs = await getAuditLogs()
  const { tenantSlug } = await getTenantContext()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Analytics Terminal</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review financial performance ledgers, technician repair metrics, and system security audit trails.
        </p>
      </div>

      <ReportsClient
        salesReport={salesReport}
        techReport={techReport}
        initialAuditLogs={auditLogs}
        tenantSlug={tenantSlug}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </div>
  )
}
