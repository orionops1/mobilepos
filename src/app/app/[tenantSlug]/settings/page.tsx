import React from 'react'
import { getBusinessSettings } from '@/app/actions/billing'
import SettingsClient from './SettingsClient'
import { getTenantContext } from '@/lib/getTenantContext'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const { userRole, tenantSlug } = await getTenantContext()

  // Authorization: Only OWNER or MANAGER can customize settings
  if (userRole !== 'OWNER' && userRole !== 'MANAGER') {
    redirect(`/app/${tenantSlug}`)
  }

  const settings = await getBusinessSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Business Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize shop branding, modify GST/VAT tax structures, upload logos, and set UPI payment QR data.
        </p>
      </div>

      <SettingsClient initialSettings={settings} />
    </div>
  )
}
