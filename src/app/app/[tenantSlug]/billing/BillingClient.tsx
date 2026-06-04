'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  Receipt,
  User,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  Printer,
  Share2,
  Trash2,
  Edit2,
  X,
  PlusCircle,
  MinusCircle,
  Percent,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  History,
  QrCode,
  MessageSquare
} from 'lucide-react'
import { createInvoice, updateInvoice, cancelInvoice } from '@/app/actions/billing'
import { InvoiceStatus } from '@prisma/client'

interface Invoice {
  id: string
  invoiceNo: string
  subtotal: any
  discount: any
  taxRate: any
  taxAmount: any
  grandTotal: any
  amountPaid: any
  status: InvoiceStatus
  createdAt: Date
  customer: {
    id: string
    name: string
    mobile: string
  }
  jobCard: {
    id: string
    jobNo: string
    brand: string
    model: string
  } | null
}

interface BillingClientProps {
  initialInvoices: Invoice[]
  customers: { id: string; name: string; mobile: string }[]
  inventoryItems: { id: string; name: string; sku: string | null; quantity: number; sellingPrice: any }[]
  readyRepairs: any[]
  tenantSettings: any
  tenantSlug: string
  userRole: string
  openAction: string
  linkJobId: string
}

export default function BillingClient({
  initialInvoices,
  customers,
  inventoryItems,
  readyRepairs,
  tenantSettings,
  tenantSlug,
  userRole,
  openAction,
  linkJobId
}: BillingClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Selected Invoice Detail state
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
  const [loadingInvoiceDetails, setLoadingInvoiceDetails] = useState(false)

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)

  // Printer Config
  const [printPaperSize, setPrintPaperSize] = useState<'A4' | '80mm' | '58mm'>('A4')
  
  // Invoice Creator Form state
  const [customerId, setCustomerId] = useState('')
  const [jobCardId, setJobCardId] = useState('')
  const [invoiceItems, setInvoiceItems] = useState<{ description: string; itemId?: string; quantity: number; unitPrice: number; maxQty?: number }[]>([
    { description: '', quantity: 1, unitPrice: 0 }
  ])
  const [discount, setDiscount] = useState('0')
  const [taxRate, setTaxRate] = useState(tenantSettings?.taxRate ? tenantSettings.taxRate.toString() : '0')
  const [amountPaid, setAmountPaid] = useState('0')
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>('UNPAID')
  const [creatorError, setCreatorError] = useState<string | null>(null)

  // Pre-fill fields if linkJobId exists (billing repair card)
  useEffect(() => {
    if (openAction === 'new') {
      setShowAddModal(true)
      if (linkJobId) {
        const linkedJob = readyRepairs.find((job) => job.id === linkJobId)
        if (linkedJob) {
          setCustomerId(linkedJob.customerId)
          setJobCardId(linkedJob.id)
          setInvoiceItems([
            {
              description: `Labour/Repair Charges: ${linkedJob.brand} ${linkedJob.model} (${linkedJob.jobNo})`,
              quantity: 1,
              unitPrice: parseFloat(linkedJob.estimatedCost) - parseFloat(linkedJob.advancePayment)
            }
          ])
          setAmountPaid((parseFloat(linkedJob.estimatedCost) - parseFloat(linkedJob.advancePayment)).toString())
          setInvoiceStatus('PAID')
        }
      }
    }
  }, [openAction, linkJobId, readyRepairs])

  // Filters apply
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault()
    let url = `/app/${tenantSlug}/billing?q=${encodeURIComponent(searchQuery)}`
    if (statusFilter !== 'ALL') url += `&status=${statusFilter}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    router.push(url)
  }

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('ALL')
    setStartDate('')
    setEndDate('')
    router.push(`/app/${tenantSlug}/billing`)
  }

  // Fetch full details of single invoice
  const handleSelectInvoice = async (inv: Invoice) => {
    setLoadingInvoiceDetails(true)
    setSelectedInvoice(inv)
    try {
      // Use importable API call
      const res = await fetch(`/api/invoices/${inv.id}`)
      if (res.ok) {
        const details = await res.json()
        setSelectedInvoice(details)
      } else {
        // Fallback to Server Action (directly fetch details in background)
        const { getInvoiceById } = await import('@/app/actions/billing')
        const details = await getInvoiceById(inv.id)
        setSelectedInvoice(details)
      }
    } catch (e) {
      // fallback
    } finally {
      setLoadingInvoiceDetails(false)
    }
  }

  // Edit Invoice form prefill
  const openEditModal = () => {
    if (!selectedInvoice) return
    setInvoiceItems(selectedInvoice.items.map((item: any) => ({
      id: item.id,
      description: item.description,
      itemId: item.itemId || undefined,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice),
      maxQty: item.itemId ? (inventoryItems.find((inv) => inv.id === item.itemId)?.quantity || 0) + item.quantity : undefined
    })))
    setDiscount(parseFloat(selectedInvoice.discount).toString())
    setTaxRate(parseFloat(selectedInvoice.taxRate).toString())
    setAmountPaid(parseFloat(selectedInvoice.amountPaid).toString())
    setInvoiceStatus(selectedInvoice.status)
    setCreatorError(null)
    setShowEditModal(true)
  }

  // Invoice creator calculations
  const calculateInvoiceSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }
  const calculateInvoiceTotal = () => {
    const sub = calculateInvoiceSubtotal()
    const disc = parseFloat(discount) || 0
    const net = Math.max(0, sub - disc)
    const tax = (net * (parseFloat(taxRate) || 0)) / 100
    return net + tax
  }

  // Handle linking a job card
  const handleLinkJobCardChange = (jobId: string) => {
    setJobCardId(jobId)
    if (!jobId) return

    const linkedJob = readyRepairs.find((job) => job.id === jobId)
    if (linkedJob) {
      setCustomerId(linkedJob.customerId)
      // Set the due balance as unit price
      const remainingBalance = parseFloat(linkedJob.estimatedCost) - parseFloat(linkedJob.advancePayment)
      
      setInvoiceItems([
        {
          description: `Labour/Repair Charges: ${linkedJob.brand} ${linkedJob.model} (${linkedJob.jobNo})`,
          quantity: 1,
          unitPrice: remainingBalance
        }
      ])
      setAmountPaid(remainingBalance.toString())
      setInvoiceStatus('PAID')
    }
  }

  // Item List manipulators
  const addInvoiceItemLine = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, unitPrice: 0 }])
  }
  const removeInvoiceItemLine = (idx: number) => {
    const next = [...invoiceItems]
    next.splice(idx, 1)
    setInvoiceItems(next.length === 0 ? [{ description: '', quantity: 1, unitPrice: 0 }] : next)
  }
  const handleItemLineChange = (idx: number, field: string, value: any) => {
    const next = [...invoiceItems]
    
    if (field === 'itemId') {
      const selectedItem = inventoryItems.find((item) => item.id === value)
      if (selectedItem) {
        next[idx] = {
          ...next[idx],
          itemId: value,
          description: selectedItem.name,
          unitPrice: parseFloat(selectedItem.sellingPrice),
          maxQty: selectedItem.quantity
        }
      }
    } else {
      next[idx] = { ...next[idx], [field]: value }
    }
    setInvoiceItems(next)
  }

  // Create Invoice Action
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatorError(null)

    if (!customerId) {
      setCreatorError('Please select a customer.')
      return
    }

    startTransition(async () => {
      try {
        await createInvoice({
          customerId,
          jobCardId: jobCardId || undefined,
          items: invoiceItems.map((item) => ({
            description: item.description,
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          })),
          discount: parseFloat(discount) || 0,
          taxRate: parseFloat(taxRate) || 0,
          amountPaid: parseFloat(amountPaid) || 0,
          status: invoiceStatus
        })
        
        setShowAddModal(false)
        router.refresh()
      } catch (err: any) {
        setCreatorError(err.message || 'Failed to create invoice.')
      }
    })
  }

  // Edit Invoice Action
  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvoice) return
    setCreatorError(null)

    startTransition(async () => {
      try {
        await updateInvoice(selectedInvoice.id, {
          items: invoiceItems.map((item) => ({
            description: item.description,
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          })),
          discount: parseFloat(discount) || 0,
          taxRate: parseFloat(taxRate) || 0,
          amountPaid: parseFloat(amountPaid) || 0,
          status: invoiceStatus
        })

        setShowEditModal(false)
        // Refresh details view
        const { getInvoiceById } = await import('@/app/actions/billing')
        const updated = await getInvoiceById(selectedInvoice.id)
        setSelectedInvoice(updated)
        router.refresh()
      } catch (err: any) {
        setCreatorError(err.message || 'Failed to update invoice.')
      }
    })
  }

  // Cancel Invoice Action
  const handleCancelInvoice = async () => {
    if (!selectedInvoice) return
    if (!confirm('Are you sure you want to cancel this invoice? This will set status to CANCELLED and ROLL BACK inventory counts of any linked spare parts.')) return

    startTransition(async () => {
      try {
        await cancelInvoice(selectedInvoice.id)
        // Refresh details
        const { getInvoiceById } = await import('@/app/actions/billing')
        const updated = await getInvoiceById(selectedInvoice.id)
        setSelectedInvoice(updated)
        router.refresh()
      } catch (e: any) {
        alert(e.message)
      }
    })
  }

  // Trigger Client-side customised printing layouts
  const executeInvoicePrint = () => {
    if (!selectedInvoice) return

    // Create a hidden print iframe if not existing
    let iframe = document.getElementById('invoice-print-frame') as HTMLIFrameElement
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.id = 'invoice-print-frame'
      iframe.style.position = 'fixed'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = 'none'
      document.body.appendChild(iframe)
    }

    const { invoiceNo, grandTotal, discount: disc, subtotal, taxAmount, taxRate: tRate, amountPaid: paid, status, customer, jobCard, items, tenant } = selectedInvoice
    const currencySym = '₹'
    const due = Math.max(0, parseFloat(grandTotal) - parseFloat(paid))

    // Build print HTML document dynamically
    let htmlContent = ''

    if (printPaperSize === 'A4') {
      htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Outfit', 'Inter', sans-serif; color: #111; margin: 40px; font-size: 13px; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 25px; }
              .shop-title { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
              .invoice-title { font-size: 24px; font-weight: bold; color: #4f46e5; text-align: right; }
              .details { display: flex; justify-content: space-between; margin-bottom: 30px; line-height: 1.6; }
              .details div { flex: 1; }
              .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .table th { background: #f3f4f6; padding: 10px; border-bottom: 1px solid #ddd; text-align: left; font-weight: bold; }
              .table td { padding: 10px; border-bottom: 1px solid #f3f4f6; }
              .summary { display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 15px; }
              .summary-ledger { width: 250px; line-height: 1.8; text-align: right; }
              .summary-ledger div { display: flex; justify-content: space-between; }
              .qr-box { display: flex; flex-direction: column; align-items: center; border: 1px solid #eee; padding: 15px; border-radius: 8px; width: 130px; }
              .qr-label { font-size: 9px; text-transform: uppercase; color: #666; margin-top: 8px; font-weight: bold; text-align: center; }
              .terms { border-top: 1px solid #eee; padding-top: 15px; margin-top: 40px; font-size: 10px; color: #666; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="shop-title">${tenant.name}</div>
                <div>${tenant.address || ''}</div>
                <div>Ph: ${tenant.phone || ''} | ${tenant.email || ''}</div>
                ${tenant.taxNumber ? `<div style="font-weight: bold; margin-top:5px;">GST/VAT: ${tenant.taxNumber}</div>` : ''}
              </div>
              <div>
                <div class="invoice-title">INVOICE</div>
                <div style="text-align: right; margin-top: 5px;">
                  <strong>Invoice No:</strong> ${invoiceNo}<br>
                  <strong>Date:</strong> ${new Date(selectedInvoice.createdAt).toLocaleDateString()}<br>
                  <strong>Status:</strong> <span style="text-transform: uppercase; font-weight: bold; color: ${status === 'PAID' ? 'green' : 'orange'}">${status}</span>
                </div>
              </div>
            </div>

            <div class="details">
              <div>
                <strong>Billed To:</strong><br>
                ${customer.name}<br>
                Phone: ${customer.mobile}<br>
                ${customer.address ? `Address: ${customer.address}` : ''}
              </div>
              <div>
                ${jobCard ? `
                  <strong>Repair Summary:</strong><br>
                  Job Card: ${jobCard.jobNo}<br>
                  Device: ${jobCard.brand} ${jobCard.model}<br>
                ` : ''}
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center; width: 80px;">Qty</th>
                  <th style="text-align: right; width: 120px;">Unit Price</th>
                  <th style="text-align: right; width: 120px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item: any) => `
                  <tr>
                    <td>${item.description}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${currencySym}${parseFloat(item.unitPrice).toFixed(2)}</td>
                    <td style="text-align: right;">${currencySym}${parseFloat(item.totalPrice).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="summary">
              <div>
                ${tenant.qrCodeData ? `
                  <div class="qr-box">
                    <div style="width: 100px; height: 100px; display:flex; align-items:center; justify-content:center; border: 1px solid #ccc; font-weight: bold; font-size:10px; color:#4f46e5; text-align:center;">
                      UPI QR Code<br>SCAN TO PAY
                    </div>
                    <div class="qr-label">Scan to Settle</div>
                  </div>
                ` : ''}
              </div>
              <div class="summary-ledger">
                <div><span>Subtotal:</span> <strong>${currencySym}${parseFloat(subtotal).toFixed(2)}</strong></div>
                ${parseFloat(disc) > 0 ? `<div><span>Discount:</span> <strong style="color: green;">-${currencySym}${parseFloat(disc).toFixed(2)}</strong></div>` : ''}
                ${parseFloat(taxAmount) > 0 ? `<div><span>Tax (${tRate}%):</span> <strong>${currencySym}${parseFloat(taxAmount).toFixed(2)}</strong></div>` : ''}
                <div style="border-top: 1px solid #ddd; padding-top: 5px; font-size: 15px; margin-top:5px;">
                  <span>Grand Total:</span> <strong style="color: #4f46e5;">${currencySym}${parseFloat(grandTotal).toFixed(2)}</strong>
                </div>
                <div><span>Paid Amount:</span> <strong>${currencySym}${parseFloat(paid).toFixed(2)}</strong></div>
                ${due > 0 ? `<div style="color: red;"><span>Balance Due:</span> <strong>${currencySym}${due.toFixed(2)}</strong></div>` : ''}
              </div>
            </div>

            <div class="terms">
              <strong>Terms & Conditions:</strong><br>
              1. Goods once sold cannot be taken back or exchanged.<br>
              2. 30 days warranty on spare parts replacement, excluding physical or liquid damage.<br>
              3. Please inspect the device before leaving the counters. We are not responsible for any issues reported later.
            </div>
          </body>
        </html>
      `
    } else {
      // Thermal layout (80mm / 58mm)
      const widthClass = printPaperSize === '80mm' ? 'width: 290px;' : 'width: 210px;'
      htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'monospace'; color: #000; margin: 5px; font-size: 11px; ${widthClass} line-height: 1.4; }
              .center { text-align: center; }
              .divider { border-top: 1px dashed #000; margin: 8px 0; }
              .bold { font-weight: bold; }
              .item-line { display: flex; justify-content: space-between; margin-bottom: 4px; }
              .totals-line { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px; }
            </style>
          </head>
          <body>
            <div class="center">
              <span class="bold" style="font-size: 13px;">${tenant.name}</span><br>
              ${tenant.address || ''}<br>
              Phone: ${tenant.phone || ''}<br>
              ${tenant.taxNumber ? `GST: ${tenant.taxNumber}` : ''}
            </div>
            
            <div class="divider"></div>
            
            <div>
              <strong>Inv No:</strong> ${invoiceNo}<br>
              <strong>Date:</strong> ${new Date(selectedInvoice.createdAt).toLocaleDateString()}<br>
              <strong>Client:</strong> ${customer.name} (${customer.mobile})
            </div>

            <div class="divider"></div>

            <div class="bold">ITEMS:</div>
            ${items.map((item: any) => `
              <div style="margin-bottom: 6px;">
                <div>${item.description}</div>
                <div style="display: flex; justify-content: space-between; font-size: 10px; color:#555;">
                  <span>${item.quantity} x ${currencySym}${parseFloat(item.unitPrice).toFixed(0)}</span>
                  <span>${currencySym}${parseFloat(item.totalPrice).toFixed(0)}</span>
                </div>
              </div>
            `).join('')}

            <div class="divider"></div>

            <div class="totals-line"><span>Subtotal:</span> <span>${currencySym}${parseFloat(subtotal).toFixed(0)}</span></div>
            ${parseFloat(disc) > 0 ? `<div class="totals-line"><span>Discount:</span> <span>-${currencySym}${parseFloat(disc).toFixed(0)}</span></div>` : ''}
            ${parseFloat(taxAmount) > 0 ? `<div class="totals-line"><span>Tax (${tRate}%):</span> <span>${currencySym}${parseFloat(taxAmount).toFixed(0)}</span></div>` : ''}
            <div class="totals-line bold" style="font-size: 12px; margin-top: 4px;">
              <span>Total:</span> <span>${currencySym}${parseFloat(grandTotal).toFixed(0)}</span>
            </div>
            <div class="totals-line"><span>Paid:</span> <span>${currencySym}${parseFloat(paid).toFixed(0)}</span></div>
            ${due > 0 ? `<div class="totals-line bold" style="color: red;"><span>Balance:</span> <span>${currencySym}${due.toFixed(0)}</span></div>` : ''}

            <div class="divider"></div>

            <div class="center" style="font-size: 9px;">
              Thank you for your business!<br>
              Fix and Repair Complete.
            </div>
          </body>
        </html>
      `
    }

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(htmlContent)
      doc.close()
      
      // Delay printing to let styles load inside iframe
      setTimeout(() => {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        setShowPrintModal(false)
      }, 500)
    }
  }

  // Pre-generate WhatsApp message
  const getWhatsAppMessage = (type: 'pdf' | 'summary' | 'status') => {
    if (!selectedInvoice) return ''
    const { invoiceNo, grandTotal, amountPaid: paid, customer, jobCard } = selectedInvoice
    const due = Math.max(0, parseFloat(grandTotal) - parseFloat(paid))
    const tenantName = tenantSettings?.name || 'Westerngate POS'

    let text = ''
    if (type === 'summary') {
      text = `Hello ${customer.name},\n\nYour bill summary for Invoice *${invoiceNo}* at *${tenantName}* is here:\n\n*Total Amount:* ₹${parseFloat(grandTotal).toFixed(0)}\n*Paid:* ₹${parseFloat(paid).toFixed(0)}\n*Due Balance:* ₹${due.toFixed(0)}\n\nThank you for choosing us!`
    } else if (type === 'status') {
      text = `Hello ${customer.name},\n\nThis is to update you that your device repair job *${jobCard?.jobNo || ''}* (${jobCard?.brand || ''} ${jobCard?.model || ''}) has been billed under Invoice *${invoiceNo}*. Current status is ready for delivery.\n\nThank you, *${tenantName}*!`
    } else {
      // PDF link sharing (mocked or custom url)
      text = `Hello ${customer.name},\n\nYou can access/download your digital invoice *${invoiceNo}* at the following link:\n\nhttps://${tenantSlug}.westerngate.com/invoices/${selectedInvoice.id}\n\nThank you, *${tenantName}*!`
    }
    
    return encodeURIComponent(text)
  }

  // Send WhatsApp Action
  const triggerWhatsAppSend = (type: 'pdf' | 'summary' | 'status') => {
    if (!selectedInvoice) return
    const message = getWhatsAppMessage(type)
    const mobile = selectedInvoice.customer.mobile
    // Construct preformatted api WhatsApp URL
    const url = `https://api.whatsapp.com/send?phone=91${mobile}&text=${message}`
    window.open(url, '_blank')
    setShowWhatsAppModal(false)
  }

  const getInvoiceStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      case 'PARTIAL':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      case 'UNPAID':
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* List Column */}
      <div className="lg:col-span-2 space-y-4">
        {/* Advanced Filter panel */}
        <form onSubmit={handleApplyFilters} className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
            <span className="font-bold text-white uppercase tracking-wider text-[10px]">Filter Invoices</span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-[10px] text-slate-450 hover:text-white font-bold"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Search Query</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="INV no, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-2 bg-slate-900 border border-slate-850 rounded-lg text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Status Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Payment Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-850 rounded-lg text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Payments</option>
                <option value="PAID">PAID</option>
                <option value="PARTIAL">PARTIAL</option>
                <option value="UNPAID">UNPAID</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-850 rounded-lg text-slate-350 focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-850 rounded-lg text-slate-350 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-lg shadow-indigo-600/10"
            >
              Apply Filters
            </button>
          </div>
        </form>

        {/* Invoice Creator Quick Add Trigger */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transactions Database</span>
          <button
            onClick={() => {
              setCustomerId('')
              setJobCardId('')
              setInvoiceItems([{ description: '', quantity: 1, unitPrice: 0 }])
              setDiscount('0')
              setAmountPaid('0')
              setInvoiceStatus('UNPAID')
              setCreatorError(null)
              setShowAddModal(true)
            }}
            className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/10 flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Bill</span>
          </button>
        </div>

        {/* Invoices List cards */}
        <div className="space-y-3.5">
          {initialInvoices.length > 0 ? (
            initialInvoices.map((inv) => {
              const isSelected = selectedInvoice?.id === inv.id
              const due = Math.max(0, parseFloat(inv.grandTotal) - parseFloat(inv.amountPaid))

              return (
                <div
                  key={inv.id}
                  onClick={() => handleSelectInvoice(inv)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-950 border-slate-900 hover:border-slate-850 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-indigo-400">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{inv.invoiceNo}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold tracking-wider ${getInvoiceStatusBadge(inv.status)}`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-1">{inv.customer.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1 flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(inv.createdAt).toLocaleDateString()}</span>
                        {inv.jobCard && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-400 font-medium">{inv.jobCard.jobNo}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col justify-between items-end border-t sm:border-t-0 border-slate-900 pt-3.5 sm:pt-0">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Billed</span>
                      <p className="font-bold text-white text-xs">₹{parseFloat(inv.grandTotal).toFixed(0)}</p>
                    </div>
                    {due > 0 && inv.status !== 'CANCELLED' && (
                      <div className="text-right sm:mt-1.5">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Due Bal.</span>
                        <p className="font-bold text-amber-400 text-xs">₹{due.toFixed(0)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-12 text-center bg-slate-950 border border-slate-900 rounded-2xl">
              <Receipt className="h-8 w-8 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 text-xs">No invoices archived.</p>
            </div>
          )}
        </div>
      </div>

      {/* Operations Drawer */}
      <div className="space-y-4">
        {selectedInvoice ? (
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-6 animate-slide-up sticky top-20">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-slate-900 pb-4">
              <div>
                <h2 className="text-base font-bold text-white">{selectedInvoice.invoiceNo}</h2>
                <span className="text-[10px] text-slate-500 font-medium">Billed: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex space-x-2">
                {selectedInvoice.status !== 'CANCELLED' && (
                  <button
                    onClick={openEditModal}
                    className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl transition-all cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                )}
                {selectedInvoice.status !== 'CANCELLED' && (
                  <button
                    onClick={handleCancelInvoice}
                    className="p-2 text-rose-450 hover:bg-rose-950/20 bg-slate-900 border border-slate-850 hover:border-rose-950/50 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Action buttons print, share */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => setShowPrintModal(true)}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setShowWhatsAppModal(true)}
                className="py-2.5 bg-emerald-650 hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/10 cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>Share WhatsApp</span>
              </button>
            </div>

            {/* Customer Details */}
            <div className="space-y-3.5 text-xs border-t border-slate-900 pt-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Client details</h3>
              <div className="flex items-center space-x-3 text-slate-350">
                <User className="h-4 w-4 text-indigo-400" />
                <span>{selectedInvoice.customer.name}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-350">
                <Phone className="h-4 w-4 text-slate-550" />
                <span>{selectedInvoice.customer.mobile}</span>
              </div>
            </div>

            {/* Bill Summary Items Table */}
            <div className="space-y-3.5 border-t border-slate-900 pt-5 text-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Invoice Items</h3>
              {loadingInvoiceDetails ? (
                <div className="py-4 text-center">
                  <div className="h-5 w-5 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="divide-y divide-slate-900">
                    {selectedInvoice.items?.map((item: any) => (
                      <div key={item.id} className="py-2.5 flex justify-between items-start">
                        <div className="max-w-[180px]">
                          <p className="font-bold text-slate-200">{item.description}</p>
                          <span className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity} • Unit: ₹{parseFloat(item.unitPrice).toFixed(0)}</span>
                        </div>
                        <span className="font-bold text-white">₹{parseFloat(item.totalPrice).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Totals Summary ledger */}
                  <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between text-slate-450">
                      <span>Subtotal</span>
                      <span>₹{parseFloat(selectedInvoice.subtotal).toFixed(0)}</span>
                    </div>
                    {parseFloat(selectedInvoice.discount) > 0 && (
                      <div className="flex justify-between text-slate-450">
                        <span>Discount</span>
                        <span className="text-emerald-400">-₹{parseFloat(selectedInvoice.discount).toFixed(0)}</span>
                      </div>
                    )}
                    {parseFloat(selectedInvoice.taxAmount) > 0 && (
                      <div className="flex justify-between text-slate-450">
                        <span>Tax ({parseFloat(selectedInvoice.taxRate)}%)</span>
                        <span>₹{parseFloat(selectedInvoice.taxAmount).toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-900 pt-2 font-bold text-white">
                      <span>Grand Total</span>
                      <span>₹{parseFloat(selectedInvoice.grandTotal).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-450">
                      <span>Amount Paid</span>
                      <span>₹{parseFloat(selectedInvoice.amountPaid).toFixed(0)}</span>
                    </div>
                    {parseFloat(selectedInvoice.grandTotal) - parseFloat(selectedInvoice.amountPaid) > 0 && selectedInvoice.status !== 'CANCELLED' && (
                      <div className="flex justify-between text-[11px] font-bold text-amber-400 border-t border-slate-900/50 pt-1">
                        <span>Balance Due</span>
                        <span>₹{(parseFloat(selectedInvoice.grandTotal) - parseFloat(selectedInvoice.amountPaid)).toFixed(0)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Audit Log / Edit History Log */}
            {selectedInvoice.editLogs?.length > 0 && (
              <div className="border-t border-slate-900 pt-5 space-y-3.5 text-xs">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <History className="h-4 w-4 text-indigo-400" />
                  <span>Edit History logs</span>
                </h3>
                <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                  {selectedInvoice.editLogs.map((log: any) => (
                    <div key={log.id} className="p-2.5 bg-slate-900/60 border border-slate-850 rounded-xl">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                        <span>{log.changedBy}</span>
                        <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-350">{log.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-900 border-dashed rounded-2xl p-8 text-center text-slate-500 py-16">
            <Receipt className="h-6 w-6 text-slate-650 mx-auto mb-2" />
            <p className="text-xs">Select an invoice visual ticket to review item details, payment structures, and print logs.</p>
          </div>
        )}
      </div>

      {/* Bill Creator Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl w-full max-w-3xl p-6 space-y-6 animate-slide-up relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-850 rounded-xl cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h2 className="text-base font-bold text-white">
                {showAddModal ? 'Generate Invoice Bill' : 'Edit Invoice Transaction'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Add multi-item sales lines and log payment records.
              </p>
            </div>

            {creatorError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                {creatorError}
              </div>
            )}

            <form onSubmit={showAddModal ? handleCreateInvoice : handleUpdateInvoice} className="space-y-4 text-xs">
              {showAddModal && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-900 pb-4">
                  {/* Customer Selector */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Billed Client *</label>
                    <select
                      required
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                    >
                      <option value="">Select Customer...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.mobile})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ready Repairs link Selector */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Link Completed Repair Job</label>
                    <select
                      value={jobCardId}
                      onChange={(e) => handleLinkJobCardChange(e.target.value)}
                      className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                    >
                      <option value="">No linked repair job card</option>
                      {readyRepairs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.jobNo} - {job.brand} {job.model} ({job.customer.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Items Line Editor list */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Sale Line Items</span>
                  <button
                    type="button"
                    onClick={addInvoiceItemLine}
                    className="text-[10px] text-indigo-400 font-bold hover:underline"
                  >
                    + Add Sale Item Line
                  </button>
                </div>

                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {invoiceItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-900/40 border border-slate-900 rounded-xl">
                      {/* Optional Inventory Spare Part selector */}
                      <div className="col-span-12 sm:col-span-4 space-y-1">
                        <label className="text-[9px] font-bold text-slate-550 uppercase">Link Inventory Item</label>
                        <select
                          value={item.itemId || ''}
                          onChange={(e) => handleItemLineChange(idx, 'itemId', e.target.value)}
                          className="w-full p-2 bg-slate-900 border border-slate-850 rounded-lg text-white text-[11px] focus:outline-none"
                        >
                          <option value="">Service / Labour / Custom Sales</option>
                          {inventoryItems.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                              {inv.name} (Stock: {inv.quantity})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Description */}
                      <div className="col-span-12 sm:col-span-4 space-y-1">
                        <label className="text-[9px] font-bold text-slate-550 uppercase">Item Description *</label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleItemLineChange(idx, 'description', e.target.value)}
                          placeholder="e.g. Screen Replacement Labour"
                          className="w-full p-2 bg-slate-900 border border-slate-850 rounded-lg text-white text-[11px] focus:outline-none"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="col-span-6 sm:col-span-2 space-y-1">
                        <label className="text-[9px] font-bold text-slate-550 uppercase">Unit Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={item.unitPrice || ''}
                          onChange={(e) => handleItemLineChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-slate-900 border border-slate-850 rounded-lg text-white text-[11px] focus:outline-none"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="col-span-4 sm:col-span-1 space-y-1">
                        <label className="text-[9px] font-bold text-slate-550 uppercase">Qty</label>
                        <input
                          type="number"
                          required
                          value={item.quantity}
                          min={1}
                          max={item.maxQty}
                          onChange={(e) => handleItemLineChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full p-2 bg-slate-900 border border-slate-850 rounded-lg text-white text-[11px] focus:outline-none"
                        />
                      </div>

                      {/* Delete item line button */}
                      <div className="col-span-2 sm:col-span-1 text-center pt-4">
                        <button
                          type="button"
                          onClick={() => removeInvoiceItemLine(idx)}
                          className="p-1.5 text-rose-455 hover:bg-rose-950/20 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Cost summaries and Payment methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-900 pt-5">
                {/* Adjustments */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Flat Discount (₹)</label>
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">GST/VAT Rate (%)</label>
                      <input
                        type="number"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Amount Collected (₹)</label>
                      <input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Payment Status</label>
                      <select
                        value={invoiceStatus}
                        onChange={(e) => setInvoiceStatus(e.target.value as InvoiceStatus)}
                        className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none text-xs"
                      >
                        <option value="PAID">PAID</option>
                        <option value="PARTIAL">PARTIAL</option>
                        <option value="UNPAID">UNPAID</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Final Calculation summary display box */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Items Subtotal</span>
                      <span>₹{calculateInvoiceSubtotal().toFixed(2)}</span>
                    </div>
                    {parseFloat(discount) > 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>Discount Deductions</span>
                        <span className="text-emerald-400">-₹{parseFloat(discount).toFixed(2)}</span>
                      </div>
                    )}
                    {parseFloat(taxRate) > 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>Tax Added ({parseFloat(taxRate)}%)</span>
                        <span>
                          ₹{((Math.max(0, calculateInvoiceSubtotal() - (parseFloat(discount) || 0)) * (parseFloat(taxRate) || 0)) / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-900 pt-4 flex justify-between items-center mt-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Grand Total Due</span>
                      <span className="text-xl font-bold text-white">₹{calculateInvoiceTotal().toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Pending Due Balance</span>
                      <span className="text-sm font-bold text-amber-400">
                        ₹{Math.max(0, calculateInvoiceTotal() - (parseFloat(amountPaid) || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end space-x-3 border-t border-slate-900 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                  }}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? 'Logging bill...' : showAddModal ? 'Generate & Save Bill' : 'Save Invoice Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printer paper size Modal Selection */}
      {showPrintModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm z-50 p-4">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl w-full max-w-sm p-6 space-y-6 animate-slide-up relative">
            <button
              onClick={() => setShowPrintModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-850 rounded-xl cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h2 className="text-sm font-bold text-white">Printer Configuration</h2>
              <p className="text-[11px] text-slate-550 mt-1">Select printing template paper dimensions.</p>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { size: 'A4', desc: 'Standard Office Layout (A4 size)' },
                { size: '80mm', desc: 'Desktop Thermal Print Layout (80mm width)' },
                { size: '58mm', desc: 'Portable / USB Thermal Print Layout (58mm width)' }
              ].map((layout) => (
                <div
                  key={layout.size}
                  onClick={() => setPrintPaperSize(layout.size as any)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                    printPaperSize === layout.size
                      ? 'bg-indigo-600/10 border-indigo-500 text-white font-semibold'
                      : 'bg-slate-900/50 border-slate-900 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <div>
                    <p className="text-xs text-white">{layout.size} Template</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{layout.desc}</p>
                  </div>
                  {printPaperSize === layout.size && <CheckCircle className="h-4.5 w-4.5 text-indigo-400" />}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-3.5 py-2 bg-slate-900 text-slate-400 font-semibold rounded-lg text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={executeInvoicePrint}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs flex items-center space-x-1"
              >
                <Printer className="h-4 w-4" />
                <span>Confirm & Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp share options modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm z-50 p-4">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl w-full max-w-sm p-6 space-y-6 animate-slide-up relative">
            <button
              onClick={() => setShowWhatsAppModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-850 rounded-xl cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h2 className="text-sm font-bold text-white">Share Invoice on WhatsApp</h2>
              <p className="text-[11px] text-slate-550 mt-1">Select the format for WhatsApp sharing.</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <button
                onClick={() => triggerWhatsAppSend('summary')}
                className="w-full text-left p-3.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-900 rounded-xl text-white transition-all flex items-center space-x-3.5"
              >
                <FileText className="h-5 w-5 text-indigo-400" />
                <div>
                  <p className="text-xs font-semibold">Send Invoice Summary text</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Preformatted details: invoice no, total billing, and balances.</p>
                </div>
              </button>

              <button
                onClick={() => triggerWhatsAppSend('pdf')}
                className="w-full text-left p-3.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-900 rounded-xl text-white transition-all flex items-center space-x-3.5"
              >
                <Share2 className="h-5 w-5 text-indigo-400" />
                <div>
                  <p className="text-xs font-semibold">Send Digital PDF Link</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Sends a link for the customer to view/print their digital copy.</p>
                </div>
              </button>

              <button
                onClick={() => triggerWhatsAppSend('status')}
                className="w-full text-left p-3.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-900 rounded-xl text-white transition-all flex items-center space-x-3.5"
              >
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                <div>
                  <p className="text-xs font-semibold">Send Repair ready status</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Updates the customer that their device is billed and ready for collection.</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
