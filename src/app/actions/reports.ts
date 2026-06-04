'use server'

import { db } from '@/lib/db'
import { getTenantContext } from '@/lib/getTenantContext'
import { JobStatus } from '@prisma/client'

export async function getDashboardStats() {
  const { tenantId } = await getTenantContext()

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // 1. Today's Sales
  const todayInvoices = await db.invoice.findMany({
    where: {
      tenantId,
      createdAt: { gte: startOfToday },
      status: { not: 'CANCELLED' },
    },
    select: { grandTotal: true },
  })
  const todaySales = todayInvoices.reduce((sum, inv) => sum + Number(inv.grandTotal), 0)

  // 2. Monthly Sales
  const monthInvoices = await db.invoice.findMany({
    where: {
      tenantId,
      createdAt: { gte: startOfMonth },
      status: { not: 'CANCELLED' },
    },
    select: { grandTotal: true },
  })
  const monthlySales = monthInvoices.reduce((sum, inv) => sum + Number(inv.grandTotal), 0)

  // 3. Pending Repairs
  const pendingRepairs = await db.jobCard.count({
    where: {
      tenantId,
      status: { notIn: ['READY', 'DELIVERED'] },
    },
  })

  // 4. Completed Repairs
  const completedRepairs = await db.jobCard.count({
    where: {
      tenantId,
      status: { in: ['READY', 'DELIVERED'] },
    },
  })

  // 5. Total Customers
  const totalCustomers = await db.customer.count({
    where: { tenantId },
  })

  // 6. Total Devices Received
  const totalDevices = await db.jobCard.count({
    where: { tenantId },
  })

  // 7. Recent Invoices
  const recentTransactions = await db.invoice.findMany({
    where: { tenantId },
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  // 8. Top Customers
  const topCustomersRaw = await db.invoice.groupBy({
    by: ['customerId'],
    where: {
      tenantId,
      status: { not: 'CANCELLED' },
    },
    _sum: {
      grandTotal: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        grandTotal: 'desc',
      },
    },
    take: 5,
  })

  const topCustomers = await Promise.all(
    topCustomersRaw.map(async (c) => {
      const customer = await db.customer.findUnique({
        where: { id: c.customerId },
        select: { name: true, mobile: true },
      })
      return {
        name: customer?.name || 'Unknown',
        mobile: customer?.mobile || '',
        totalSpent: Number(c._sum.grandTotal || 0),
        billsCount: c._count.id,
      }
    })
  )

  // 9. Revenue Analytics (Last 7 Days)
  const last7DaysData = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    
    const nextD = new Date(d)
    nextD.setDate(d.getDate() + 1)

    const dayInvoices = await db.invoice.findMany({
      where: {
        tenantId,
        createdAt: { gte: d, lt: nextD },
        status: { not: 'CANCELLED' },
      },
      select: { grandTotal: true },
    })

    const daySalesCount = dayInvoices.reduce((sum, inv) => sum + Number(inv.grandTotal), 0)
    last7DaysData.push({
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      revenue: daySalesCount,
    })
  }

  // 10. Repair Status Summary Counts
  const repairStatusCounts = await db.jobCard.groupBy({
    by: ['status'],
    where: { tenantId },
    _count: {
      id: true,
    },
  })

  const repairStatusSummary = {
    RECEIVED: 0,
    DIAGNOSING: 0,
    WAITING_PARTS: 0,
    REPAIRING: 0,
    READY: 0,
    DELIVERED: 0,
  }

  repairStatusCounts.forEach((group) => {
    if (group.status in repairStatusSummary) {
      repairStatusSummary[group.status as JobStatus] = group._count.id
    }
  })

  return {
    todaySales,
    monthlySales,
    pendingRepairs,
    completedRepairs,
    totalCustomers,
    totalDevices,
    recentTransactions: recentTransactions.map((tx) => ({
      id: tx.id,
      invoiceNo: tx.invoiceNo,
      customerName: tx.customer.name,
      grandTotal: Number(tx.grandTotal),
      status: tx.status,
      createdAt: tx.createdAt,
    })),
    topCustomers,
    revenueAnalytics: last7DaysData,
    repairStatusSummary,
  }
}

export async function getSalesReport(startDate?: string, endDate?: string) {
  const { tenantId } = await getTenantContext()

  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30))
  const end = endDate ? new Date(endDate) : new Date()
  end.setHours(23, 59, 59, 999)

  const invoices = await db.invoice.findMany({
    where: {
      tenantId,
      createdAt: { gte: start, lte: end },
    },
    include: {
      customer: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  let totalSalesVal = 0
  let totalCollectedVal = 0
  let pendingCollectionVal = 0
  let cancelledCountVal = 0

  invoices.forEach((inv) => {
    if (inv.status === 'CANCELLED') {
      cancelledCountVal++
    } else {
      totalSalesVal += Number(inv.grandTotal)
      totalCollectedVal += Number(inv.amountPaid)
      pendingCollectionVal += Math.max(0, Number(inv.grandTotal) - Number(inv.amountPaid))
    }
  })

  return {
    invoices: invoices.map((inv) => ({
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      customerName: inv.customer.name,
      customerMobile: inv.customer.mobile,
      grandTotal: Number(inv.grandTotal),
      amountPaid: Number(inv.amountPaid),
      status: inv.status,
      createdAt: inv.createdAt,
    })),
    summary: {
      totalSales: totalSalesVal,
      totalCollected: totalCollectedVal,
      pendingCollection: pendingCollectionVal,
      cancelledCount: cancelledCountVal,
      totalCount: invoices.length,
    },
  }
}

export async function getTechnicianPerformanceReport() {
  const { tenantId } = await getTenantContext()

  const techs = await db.user.findMany({
    where: {
      tenantId,
      OR: [
        { role: 'TECHNICIAN' },
        { role: 'OWNER' },
        { role: 'MANAGER' },
      ],
    },
    select: {
      id: true,
      name: true,
      role: true,
    },
  })

  const performance = await Promise.all(
    techs.map(async (tech) => {
      const completed = await db.jobCard.count({
        where: {
          tenantId,
          technicianId: tech.id,
          status: { in: ['READY', 'DELIVERED'] },
        },
      })

      const total = await db.jobCard.count({
        where: {
          tenantId,
          technicianId: tech.id,
        },
      })

      return {
        name: tech.name,
        role: tech.role,
        completedJobs: completed,
        totalAssignedJobs: total,
        efficiency: total > 0 ? Math.round((completed / total) * 100) : 0,
      }
    })
  )

  return performance.sort((a, b) => b.completedJobs - a.completedJobs)
}

export async function getAuditLogs() {
  const { tenantId } = await getTenantContext()

  return db.auditLog.findMany({
    where: { tenantId },
    include: {
      user: {
        select: { name: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}
