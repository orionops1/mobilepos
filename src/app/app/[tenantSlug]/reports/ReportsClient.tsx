'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  FileSpreadsheet,
  Download,
  BarChart3,
  TrendingUp,
  DollarSign,
  Wrench,
  Shield,
  Activity,
  User,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react'

interface ReportsClientProps {
  salesReport: {
    invoices: any[]
    summary: {
      totalSales: number
      totalCollected: number
      pendingCollection: number
      cancelledCount: number
      totalCount: number
    }
  }
  techReport: any[]
  initialAuditLogs: any[]
  tenantSlug: string
  initialStartDate: string
  initialEndDate: string
}

export default function ReportsClient({
  salesReport,
  techReport,
  initialAuditLogs,
  tenantSlug,
  initialStartDate,
  initialEndDate
}: ReportsClientProps) {
  const router = useRouter()
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)
  const [activeTab, setActiveTab] = useState<'sales' | 'technicians' | 'audit'>('sales')

  const handleFilterDate = (e: React.FormEvent) => {
    e.preventDefault()
    let url = `/app/${tenantSlug}/reports`
    const params = []
    if (startDate) params.push(`startDate=${startDate}`)
    if (endDate) params.push(`endDate=${endDate}`)
    if (params.length > 0) url += `?${params.join('&')}`
    router.push(url)
  }

  // Export to CSV helper
  const handleExportCSV = (type: 'sales' | 'technicians') => {
    let headers: string[] = []
    let rows: string[][] = []
    let fileName = ''

    if (type === 'sales') {
      fileName = `sales_report_${startDate || 'all'}_to_${endDate || 'today'}.csv`
      headers = ['Invoice No', 'Customer Name', 'Mobile', 'Grand Total', 'Amount Paid', 'Status', 'Date']
      rows = salesReport.invoices.map((inv) => [
        inv.invoiceNo,
        inv.customerName.replace(/,/g, ' '),
        inv.customerMobile,
        inv.grandTotal.toString(),
        inv.amountPaid.toString(),
        inv.status,
        new Date(inv.createdAt).toLocaleDateString()
      ])
    } else {
      fileName = 'technician_performance_report.csv'
      headers = ['Technician Name', 'Role', 'Completed Jobs', 'Total Assigned Jobs', 'Efficiency (%)']
      rows = techReport.map((tech) => [
        tech.name.replace(/,/g, ' '),
        tech.role,
        tech.completedJobs.toString(),
        tech.totalAssignedJobs.toString(),
        `${tech.efficiency}%`
      ])
    }

    // Build CSV string
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
      + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="space-y-6">
      {/* Date filter bar (Only shown for Sales tab) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-900 overflow-x-auto">
          {[
            { id: 'sales', label: 'Sales Reports', icon: BarChart3 },
            { id: 'technicians', label: 'Technician Stats', icon: Wrench },
            { id: 'audit', label: 'Audit Logs', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {activeTab === 'sales' && (
          <form onSubmit={handleFilterDate} className="flex flex-wrap items-center gap-3 bg-slate-950 p-2 border border-slate-900 rounded-xl text-xs">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-850 p-1.5 rounded-lg text-white"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-850 p-1.5 rounded-lg text-white"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg"
            >
              Filter
            </button>
          </form>
        )}
      </div>

      {/* SALES REPORTS TAB */}
      {activeTab === 'sales' && (
        <div className="space-y-6 animate-fade-in">
          {/* Sales KPIs summaries */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Sales</span>
                <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(salesReport.summary.totalSales)}</h3>
                <span className="text-[10px] text-indigo-400 mt-1 font-semibold block">{salesReport.summary.totalCount} invoices total</span>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collected Cash</span>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(salesReport.summary.totalCollected)}</h3>
                <span className="text-[10px] text-emerald-500 mt-1 font-semibold block">Liquid funds</span>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Book Balance</span>
                <h3 className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(salesReport.summary.pendingCollection)}</h3>
                <span className="text-[10px] text-amber-500 mt-1 font-semibold block">Outstanding ledger</span>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cancelled Bills</span>
                <h3 className="text-2xl font-bold text-slate-400 mt-1">{salesReport.summary.cancelledCount}</h3>
                <span className="text-[10px] text-slate-500 mt-1 font-semibold block">Void transactions</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Action to download CSV */}
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sales Ledger Records</span>
            <button
              onClick={() => handleExportCSV('sales')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export Invoices CSV</span>
            </button>
          </div>

          {/* Invoices List table */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-semibold bg-slate-900/10">
                    <th className="p-4">Invoice No</th>
                    <th className="p-4">Customer Info</th>
                    <th className="p-4">Total Billed</th>
                    <th className="p-4">Amount Paid</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/50">
                  {salesReport.invoices.length > 0 ? (
                    salesReport.invoices.map((inv) => (
                      <tr key={inv.id} className="text-slate-350 hover:text-white transition-colors">
                        <td className="p-4 font-bold">{inv.invoiceNo}</td>
                        <td className="p-4">
                          <div>
                            <p className="font-semibold text-white">{inv.customerName}</p>
                            <span className="text-[10px] text-slate-500 block font-mono">{inv.customerMobile}</span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-white">Rs {inv.grandTotal.toFixed(0)}</td>
                        <td className="p-4 font-bold text-slate-350">Rs {inv.amountPaid.toFixed(0)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider border ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : inv.status === 'PARTIAL'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : inv.status === 'CANCELLED'
                              ? 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                              : 'bg-slate-550/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4">{new Date(inv.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No transactions recorded in this date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TECHNICIAN STATS TAB */}
      {activeTab === 'technicians' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Technician Efficiency Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">Calculates resolved repairs against total assigned jobs</p>
            </div>
            <button
              onClick={() => handleExportCSV('technicians')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export Stats CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {techReport.length > 0 ? (
              techReport.map((tech) => (
                <div key={tech.name} className="bg-slate-950 border border-slate-900 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center space-x-3.5 border-b border-slate-900 pb-3">
                    <div className="h-10 w-10 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-center text-indigo-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{tech.name}</h4>
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{tech.role}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Jobs Resolved</span>
                      <p className="font-bold text-white text-base mt-0.5">{tech.completedJobs}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Total Assigned</span>
                      <p className="font-bold text-white text-base mt-0.5">{tech.totalAssignedJobs}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Efficiency</span>
                      <p className="font-bold text-indigo-400 text-base mt-0.5">{tech.efficiency}%</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <span>Progress Stepper</span>
                      <span>{tech.efficiency}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${tech.efficiency}%` }}
                        className="h-full bg-indigo-600 rounded-full"
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 col-span-2 text-center py-6">No technicians registered.</p>
            )}
          </div>
        </div>
      )}

      {/* SECURITY AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Security Audit Trail</h3>
            <p className="text-xs text-slate-500 mt-0.5">Logs all critical database creations, setting updates, and deletions</p>
          </div>

          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5">
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {initialAuditLogs.length > 0 ? (
                initialAuditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 bg-slate-900/40 border border-slate-900 hover:border-slate-850 rounded-xl flex items-start justify-between gap-4 transition-all">
                    <div>
                      <span className="px-2 py-0.5 bg-slate-850 border border-slate-800 text-indigo-400 rounded text-[8px] font-bold tracking-wider uppercase">
                        {log.action}
                      </span>
                      <p className="text-xs text-slate-205 mt-2 font-medium">{log.details}</p>
                      <p className="text-[10px] text-slate-550 mt-1 flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>Operator: {log.user?.name || 'System Auto-job'}</span>
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 font-bold whitespace-nowrap">
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-8">Audit trail is currently empty.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
