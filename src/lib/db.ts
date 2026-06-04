import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prismaCache: Record<string, PrismaClient> | undefined
}

if (!globalThis.prismaCache) {
  globalThis.prismaCache = {}
}

export function getPrismaClient(connectionString?: string): PrismaClient {
  const url = connectionString || process.env.DATABASE_URL
  
  if (!url) {
    throw new Error('Database connection URL (DATABASE_URL) is not set in environment or tenant metadata.')
  }

  if (globalThis.prismaCache?.[url]) {
    return globalThis.prismaCache[url]
  }

  const client = new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  })

  if (globalThis.prismaCache) {
    globalThis.prismaCache[url] = client
  }

  return client
}

// Lazy initialization to avoid database connection during build time
let cachedDb: PrismaClient | null = null

export function getDb(): PrismaClient {
  if (!cachedDb) {
    cachedDb = getPrismaClient()
  }
  return cachedDb
}

// Default export for backward compatibility
export const db = {
  get user() {
    return getDb().user
  },
  get tenant() {
    return getDb().tenant
  },
  get invoice() {
    return getDb().invoice
  },
  get invoiceItem() {
    return getDb().invoiceItem
  },
  get product() {
    return getDb().product
  },
  get customer() {
    return getDb().customer
  },
  get stock() {
    return getDb().stock
  },
  get stockTransaction() {
    return getDb().stockTransaction
  },
  get repairJob() {
    return getDb().repairJob
  },
  get report() {
    return getDb().report
  },
  $connect() {
    return getDb().$connect()
  },
  $disconnect() {
    return getDb().$disconnect()
  },
  $transaction: (...args: any[]) => getDb().$transaction(...args),
} as PrismaClient

export default db
