'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save,
  CheckCircle,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Percent,
  QrCode,
  Image,
  DollarSign
} from 'lucide-react'
import { updateBusinessSettings } from '@/app/actions/billing'

interface SettingsClientProps {
  initialSettings: any
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Forms state
  const [name, setName] = useState(initialSettings?.name || '')
  const [address, setAddress] = useState(initialSettings?.address || '')
  const [phone, setPhone] = useState(initialSettings?.phone || '')
  const [email, setEmail] = useState(initialSettings?.email || '')
  const [website, setWebsite] = useState(initialSettings?.website || '')
  const [taxNumber, setTaxNumber] = useState(initialSettings?.taxNumber || '')
  const [currency, setCurrency] = useState(initialSettings?.currency || 'INR')
  const [taxRate, setTaxRate] = useState(initialSettings?.taxRate ? initialSettings.taxRate.toString() : '0')
  const [qrCodeData, setQrCodeData] = useState(initialSettings?.qrCodeData || '')
  const [logoUrl, setLogoUrl] = useState(initialSettings?.logoUrl || '')
  
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      try {
        await updateBusinessSettings({
          name,
          address,
          phone,
          email,
          website,
          taxNumber,
          currency,
          taxRate: parseFloat(taxRate) || 0,
          qrCodeData,
          logoUrl
        })
        setSuccess(true)
        router.refresh()
        // Reset success banner after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } catch (err: any) {
        setError(err.message || 'Failed to update shop configuration settings.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-6 text-xs animate-fade-in shadow-2xl">
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">Shop parameters updated successfully! Changes reflect instantly in future invoices.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl animate-fade-in">
          {error}
        </div>
      )}

      {/* Grid of details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Shop Name */}
        <div className="space-y-1.5 col-span-2">
          <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Business / Shop Name *</label>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5 col-span-2">
          <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Shop Physical Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
            ></textarea>
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Contact Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Business Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Website */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Shop Website URL</label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Tax Number */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Tax Registration Number (GST/VAT)</label>
          <input
            type="text"
            value={taxNumber}
            onChange={(e) => setTaxNumber(e.target.value)}
            className="w-full p-2.5 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
            placeholder="e.g. 29AAAAA0000A1Z5"
          />
        </div>

        {/* Currency */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Base Currency Symbol</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        {/* Default Tax Rate */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Default GST/VAT Tax Rate (%)</label>
          <div className="relative">
            <Percent className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Logo Url */}
        <div className="space-y-1.5 col-span-2">
          <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Shop Logo URL</label>
          <div className="relative">
            <Image className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
            />
          </div>
          <p className="text-[10px] text-slate-550">Provide an absolute image link. It will automatically load in invoice layouts.</p>
        </div>

        {/* UPI QR Code Data */}
        <div className="space-y-1.5 col-span-2">
          <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">UPI QR code details (India / UPI payments)</label>
          <div className="relative">
            <QrCode className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={qrCodeData}
              onChange={(e) => setQrCodeData(e.target.value)}
              placeholder="e.g. upi://pay?pa=shopupi@ybl&pn=Shop%20Name"
              className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none font-mono"
            />
          </div>
          <p className="text-[10px] text-slate-550">UPI deep link payload. If present, it will generate scan-to-pay QR codes in printed bills.</p>
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex justify-end pt-4 border-t border-slate-900">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center space-x-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isPending ? 'Saving Settings...' : 'Save Configuration'}</span>
        </button>
      </div>
    </form>
  )
}
