import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

interface LayoutProps {
  children: React.ReactNode
  params: {
    tenantSlug: string
  }
}

export default async function TenantLayout({ children, params }: LayoutProps) {
  // Ensure params is resolved
  const { tenantSlug } = await params
  
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/login?tenant=${tenantSlug}`)
  }

  // Double check that the slug matches the user's tenant slug
  if (session.user.tenantSlug.toLowerCase() !== tenantSlug.toLowerCase()) {
    redirect(`/app/${session.user.tenantSlug.toLowerCase()}`)
  }

  // Get tenant details for branding
  const tenant = await db.tenant.findUnique({
    where: { id: session.user.tenantId },
  })

  if (!tenant) {
    redirect('/login')
  }

  const userContext = {
    name: session.user.name || 'Admin',
    email: session.user.email || '',
    role: session.user.role,
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar for Navigation */}
      <Sidebar tenant={tenant} user={userContext} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar tenant={tenant} user={userContext} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900/40">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
