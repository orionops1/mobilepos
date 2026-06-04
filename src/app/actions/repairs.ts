'use server'

import { db } from '@/lib/db'
import { getTenantContext } from '@/lib/getTenantContext'
import { JobStatus } from '@prisma/client'

export async function getJobCards(filters?: { status?: JobStatus; query?: string }) {
  const { tenantId } = await getTenantContext()

  return db.jobCard.findMany({
    where: {
      tenantId,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.query
        ? {
            OR: [
              { jobNo: { contains: filters.query, mode: 'insensitive' } },
              { brand: { contains: filters.query, mode: 'insensitive' } },
              { model: { contains: filters.query, mode: 'insensitive' } },
              {
                customer: {
                  OR: [
                    { name: { contains: filters.query, mode: 'insensitive' } },
                    { mobile: { contains: filters.query } },
                  ],
                },
              },
            ],
          }
        : {}),
    },
    include: {
      customer: true,
      technician: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getJobCardById(id: string) {
  const { tenantId } = await getTenantContext()

  return db.jobCard.findFirst({
    where: { id, tenantId },
    include: {
      customer: true,
      technician: {
        select: { id: true, name: true, email: true },
      },
      invoices: true,
    },
  })
}

export async function createJobCard(data: {
  customerId: string
  brand: string
  model: string
  imei1?: string
  imei2?: string
  color?: string
  storage?: string
  issueDescription: string
  physicalCondition: string
  accessoriesReceived?: string
  estimatedCost: number
  advancePayment: number
  expectedDelivery?: Date | string
  technicianNotes?: string
  technicianId?: string
}) {
  const { tenantId, userId } = await getTenantContext()

  // Generate visual job number
  const count = await db.jobCard.count({
    where: { tenantId },
  })
  const jobNo = `JOB-${1001 + count}`

  const jobCard = await db.jobCard.create({
    data: {
      jobNo,
      tenantId,
      customerId: data.customerId,
      brand: data.brand,
      model: data.model,
      imei1: data.imei1 || null,
      imei2: data.imei2 || null,
      color: data.color || null,
      storage: data.storage || null,
      issueDescription: data.issueDescription,
      physicalCondition: data.physicalCondition,
      accessoriesReceived: data.accessoriesReceived || null,
      estimatedCost: data.estimatedCost,
      advancePayment: data.advancePayment,
      expectedDelivery: data.expectedDelivery ? new Date(data.expectedDelivery) : null,
      technicianNotes: data.technicianNotes || null,
      technicianId: data.technicianId || null,
      status: 'RECEIVED',
    },
    include: {
      customer: true,
    },
  })

  await db.auditLog.create({
    data: {
      tenantId,
      userId,
      action: 'CREATE_JOB_CARD',
      details: `Intake device: ${jobCard.brand} ${jobCard.model} for ${jobCard.customer.name}. Assigned Job Card: ${jobCard.jobNo}`,
    },
  })

  return jobCard
}

export async function updateJobCard(
  id: string,
  data: {
    brand: string
    model: string
    imei1?: string
    imei2?: string
    color?: string
    storage?: string
    issueDescription: string
    physicalCondition: string
    accessoriesReceived?: string
    estimatedCost: number
    advancePayment: number
    expectedDelivery?: Date | string
    technicianNotes?: string
    technicianId?: string
    status: JobStatus
  }
) {
  const { tenantId, userId } = await getTenantContext()

  // Verify existence
  const existing = await db.jobCard.findFirst({
    where: { id, tenantId },
  })
  if (!existing) throw new Error('Job Card not found')

  const updated = await db.jobCard.update({
    where: { id },
    data: {
      brand: data.brand,
      model: data.model,
      imei1: data.imei1 || null,
      imei2: data.imei2 || null,
      color: data.color || null,
      storage: data.storage || null,
      issueDescription: data.issueDescription,
      physicalCondition: data.physicalCondition,
      accessoriesReceived: data.accessoriesReceived || null,
      estimatedCost: data.estimatedCost,
      advancePayment: data.advancePayment,
      expectedDelivery: data.expectedDelivery ? new Date(data.expectedDelivery) : null,
      technicianNotes: data.technicianNotes || null,
      technicianId: data.technicianId || null,
      status: data.status,
    },
  })

  await db.auditLog.create({
    data: {
      tenantId,
      userId,
      action: 'UPDATE_JOB_CARD',
      details: `Updated Job Card: ${updated.jobNo}. Status: ${updated.status}`,
    },
  })

  return updated
}

export async function updateJobCardStatus(id: string, status: JobStatus, technicianNotes?: string) {
  const { tenantId, userId } = await getTenantContext()

  const existing = await db.jobCard.findFirst({
    where: { id, tenantId },
  })
  if (!existing) throw new Error('Job Card not found')

  const updated = await db.jobCard.update({
    where: { id },
    data: {
      status,
      ...(technicianNotes ? { technicianNotes } : {}),
    },
  })

  await db.auditLog.create({
    data: {
      tenantId,
      userId,
      action: 'UPDATE_JOB_STATUS',
      details: `Status of ${updated.jobNo} changed to ${status}`,
    },
  })

  return updated
}

export async function getTechnicians() {
  const { tenantId } = await getTenantContext()

  return db.user.findMany({
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
      email: true,
      role: true,
    },
  })
}
