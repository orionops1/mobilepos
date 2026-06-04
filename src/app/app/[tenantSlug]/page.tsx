import React from 'react'
import { getDashboardStats } from '@/app/actions/reports'
import { getTenantContext } from '@/lib/getTenantContext'
import {
  DollarSign,
  TrendingUp,
  Wrench,
  CheckCircle,
  Users,
  Smartphone,
  Calendar,
  ChevronRight,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Receipt
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const { userRole, tenantSlug } = await getTenantContext()
  const stats = await getDashboardStats()

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Calculate highest revenue day for SVG chart scaling
  const maxRevenue = Math.max(...stats.revenueAnalytics.map((day) => day.revenue), 1000)

  // Role Adaptivity: If user is a technician, show custom technician-centric layout
  const isTechnician = userRole === 'TECHNICIAN'

  if (isTechnician) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Technician Station</span>
              <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-medium">Active</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Real-time repair tracking and diagnostic terminal.
            </p>
          </div>
          <Link
            href={`/app/${tenantSlug}/repairs?action=new`}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
          >
            <Wrench className="h-4.5 w-4.5 mr-2" />
            <span>Intake New Device</span>
          </Link>
        </div>

        {/* Tech KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Diagnostics</span>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.repairStatusSummary.RECEIVED + stats.repairStatusSummary.DIAGNOSING}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Waiting Parts</span>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.repairStatusSummary.WAITING_PARTS}</h3>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20 text-orange-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">On Repair Table</span>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.repairStatusSummary.REPAIRING}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed (Ready)</span>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.repairStatusSummary.READY}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Tech Quick links */}
        <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Diagnostics Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href={`/app/${tenantSlug}/repairs?status=RECEIVED`}
              className="p-4 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl flex items-center justify-between group transition-all"
            >
              <div>
                <p className="text-sm font-bold text-white">Diagnostics Queue</p>
                <p className="text-xs text-slate-500 mt-1">Analyze devices received for inspection</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link
              href={`/app/${tenantSlug}/repairs?status=REPAIRING`}
              className="p-4 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl flex items-center justify-between group transition-all"
            >
              <div>
                <p className="text-sm font-bold text-white">Active Repairs</p>
                <p className="text-xs text-slate-500 mt-1">View list of models currently on repair table</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Standard Dashboard for Owners, Managers, Cashiers
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track daily repair revenues, pending items, and customer metrics.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/app/${tenantSlug}/repairs?action=new`}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-355 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Wrench className="h-4 w-4 mr-2 text-slate-400" />
            <span>Intake Repair</span>
          </Link>
          <Link
            href={`/app/${tenantSlug}/billing?action=new`}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
          >
            <Receipt className="h-4 w-4 mr-2" />
            <span>New Invoice</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Sales</span>
            <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.todaySales)}</h3>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              <span>Real-time updates</span>
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Sales</span>
            <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.monthlySales)}</h3>
            <span className="text-[10px] text-indigo-400 font-medium flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-0.5" />
              <span>Month-to-date</span>
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Repairs */}
        <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Repairs</span>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.pendingRepairs}</h3>
            <span className="text-[10px] text-amber-400 font-medium flex items-center mt-1">
              <Clock className="h-3 w-3 mr-0.5" />
              <span>Awaiting delivery</span>
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <Wrench className="h-5 w-5" />
          </div>
        </div>

        {/* Completed Repairs */}
        <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Repairs</span>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.completedRepairs}</h3>
            <span className="text-[10px] text-slate-400 font-medium flex items-center mt-1">
              <ShieldCheck className="h-3 w-3 mr-0.5" />
              <span>Ready & Delivered</span>
            </span>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Analytics (SVG Chart) */}
        <div className="lg:col-span-2 p-6 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Revenue Analytics</h3>
            <p className="text-xs text-slate-500">Sales transactions for the last 7 days</p>
          </div>

          {/* SVG Area Chart */}
          <div className="h-64 w-full mt-6 relative flex flex-col justify-end">
            <div className="w-full h-full flex items-end justify-between px-2 pb-6 border-b border-slate-900">
              {stats.revenueAnalytics.map((day, idx) => {
                const heightPercent = Math.max(8, Math.round((day.revenue / maxRevenue) * 100))
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center group relative mx-1">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-slate-950 border border-slate-850 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 text-[9px] font-bold text-white shadow-2xl whitespace-nowrap">
                      {formatCurrency(day.revenue)}
                    </div>
                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-500 group-hover:from-indigo-500 group-hover:to-purple-400 transition-all duration-300 shadow-lg shadow-indigo-600/10 cursor-pointer"
                    ></div>
                  </div>
                )
              })}
            </div>
            {/* X-Axis Labels */}
            <div className="w-full flex items-center justify-between px-2 pt-2 text-[9px] font-bold text-slate-500 tracking-wider">
              {stats.revenueAnalytics.map((day) => (
                <div key={day.date} className="flex-1 text-center truncate">
                  {day.date.split(',')[0]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Repair Status Breakdown */}
        <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Repair Status</h3>
          <div className="space-y-4">
            {[
              { label: 'Received', count: stats.repairStatusSummary.RECEIVED, color: 'bg-indigo-500' },
              { label: 'Diagnosing', count: stats.repairStatusSummary.DIAGNOSING, color: 'bg-amber-500' },
              { label: 'Waiting Parts', count: stats.repairStatusSummary.WAITING_PARTS, color: 'bg-orange-500' },
              { label: 'Repairing', count: stats.repairStatusSummary.REPAIRING, color: 'bg-purple-500' },
              { label: 'Ready for Collection', count: stats.repairStatusSummary.READY, color: 'bg-emerald-500' },
              { label: 'Delivered', count: stats.repairStatusSummary.DELIVERED, color: 'bg-slate-600' },
            ].map((status) => {
              const total = stats.totalDevices || 1
              const percentage = Math.round((status.count / total) * 100)

              return (
                <div key={status.label} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-400">{status.label}</span>
                    <span className="font-bold text-white">
                      {status.count} <span className="text-[10px] text-slate-500 font-medium">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className={`h-full rounded-full ${status.color}`}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Transactions & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Invoices</h3>
            <Link
              href={`/app/${tenantSlug}/billing`}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-0.5"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-semibold">
                  <th className="pb-3">Invoice No</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((tx) => (
                    <tr key={tx.id} className="text-slate-350 hover:text-white transition-colors">
                      <td className="py-3 font-bold">{tx.invoiceNo}</td>
                      <td className="py-3 font-medium">{tx.customerName}</td>
                      <td className="py-3 font-bold">{formatCurrency(tx.grandTotal)}</td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                            tx.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : tx.status === 'PARTIAL'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : tx.status === 'CANCELLED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No recent invoices.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers */}
        <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Customers</h3>
            <Link
              href={`/app/${tenantSlug}/customers`}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-0.5"
            >
              <span>Manage Customers</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.topCustomers.length > 0 ? (
              stats.topCustomers.map((cust) => (
                <div key={cust.mobile} className="flex justify-between items-center hover:bg-slate-900/20 p-1.5 rounded-xl transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center font-bold text-indigo-400 text-sm">
                      {cust.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{cust.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{cust.mobile}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">{formatCurrency(cust.totalSpent)}</p>
                    <p className="text-[9px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">
                      {cust.billsCount} Invoice{cust.billsCount > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No transaction history yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
