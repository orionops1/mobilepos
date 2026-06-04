import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getTenantContext() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized: No active session.')
  }
  return {
    tenantId: session.user.tenantId,
    userId: session.user.id,
    userName: session.user.name,
    userRole: session.user.role,
    tenantSlug: session.user.tenantSlug,
    tenantName: session.user.tenantName,
  }
}
export default getTenantContext
