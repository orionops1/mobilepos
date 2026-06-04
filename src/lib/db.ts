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

// Default client (Control Plane / Logical multi-tenant DB)
export const db = getPrismaClient()
export default db
