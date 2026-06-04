'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  Plus,
  Wrench,
  User,
  Phone,
  Calendar,
  DollarSign,
  Smartphone,
  Cpu,
  Clock,
  AlertTriangle,
  Play,
  CheckCircle,
  Truck,
  X,
  FileText,
  MessageSquare
} from 'lucide-react'
import { createJobCard, updateJobCard, updateJobCardStatus } from '@/app/actions/repairs'
import { createCustomer } from '@/app/actions/customers'
import { JobStatus } from '@prisma/client'

interface JobCard {
  id: string
  jobNo: string
  brand: string
  model: string
  imei1: string | null
  imei2: string | null
  color: string | null
  storage: string | null
  issueDescription: string
  physicalCondition: string
  accessoriesReceived: string | null
  estimatedCost: any
  advancePayment: any
  expectedDelivery: Date | null
  technicianNotes: string | null
  status: JobStatus
  createdAt: Date
  customer: {
    id: string
    name: string
    mobile: string
  }
  technicianId: string | null
  technician: {
    id: string
    name: string
  } | null
}

interface RepairsClientProps {
  initialJobCards: JobCard[]
  customers: { id: string; name: string; mobile: string }[]
  technicians: { id: string; name: string; role: string }[]
  tenantSlug: string
  userRole: string
  openAction: string
}

export default function RepairsClient({
  initialJobCards,
  customers,
  technicians,
  tenantSlug,
  userRole,
  openAction
}: RepairsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedJob, setSelectedJob] = useState<JobCard | null>(null)

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false)

  // Intake Form fields
  const [customerId, setCustomerId] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [imei1, setImei1] = useState('')
  const [imei2, setImei2] = useState('')
  const [color, setColor] = useState('')
  const [storage, setStorage] = useState('')
  const [issueDescription, setIssueDescription] = useState('')
  const [physicalCondition, setPhysicalCondition] = useState('')
  const [accessoriesReceived, setAccessoriesReceived] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('0')
  const [advancePayment, setAdvancePayment] = useState('0')
  const [expectedDelivery, setExpectedDelivery] = useState('')
  const [technicianId, setTechnicianId] = useState('')
  const [technicianNotes, setTechnicianNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Quick Customer fields
  const [custName, setCustName] = useState('')
  const [custMobile, setCustMobile] = useState('')
  const [custError, setCustError] = useState<string | null>(null)

  useEffect(() => {
    if (openAction === 'new') {
      setShowAddModal(true)
    }
  }, [openAction])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    let url = `/app/${tenantSlug}/repairs?q=${encodeURIComponent(searchQuery)}`
    if (statusFilter !== 'ALL') {
      url += `&status=${statusFilter}`
    }
    router.push(url)
  }

  const handleFilterStatus = (status: string) => {
    setStatusFilter(status)
    let url = `/app/${tenantSlug}/repairs`
    const params = []
    if (status !== 'ALL') {
      params.push(`status=${status}`)
    }
    if (searchQuery) {
      params.push(`q=${encodeURIComponent(searchQuery)}`)
    }
    if (params.length > 0) {
      url += `?${params.join('&')}`
    }
    router.push(url)
  }

  // Quick add customer action
  const handleQuickCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setCustError(null)

    startTransition(async () => {
      try {
        const customer = await createCustomer({
          name: custName,
          mobile: custMobile,
        })
        // Add to customer selection
        setCustomerId(customer.id)
        setShowQuickCustomerModal(false)
        setCustName('')
        setCustMobile('')
        router.refresh()
      } catch (err: any) {
        setCustError(err.message || 'Failed to create customer.')
      }
    })
  }

  // Create Job Card Intake Action
  const handleIntakeDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!customerId) {
      setError('Please select a customer or quick-register one.')
      return
    }

    startTransition(async () => {
      try {
        await createJobCard({
          customerId,
          brand,
          model,
          imei1,
          imei2,
          color,
          storage,
          issueDescription,
          physicalCondition,
          accessoriesReceived,
          estimatedCost: parseFloat(estimatedCost) || 0,
          advancePayment: parseFloat(advancePayment) || 0,
          expectedDelivery: expectedDelivery || undefined,
          technicianId: technicianId || undefined,
          technicianNotes: technicianNotes || undefined,
        })
        setShowAddModal(false)
        // Reset form
        setCustomerId('')
        setBrand('')
        setModel('')
        setImei1('')
        setImei2('')
        setColor('')
        setStorage('')
        setIssueDescription('')
        setPhysicalCondition('')
        setAccessoriesReceived('')
        setEstimatedCost('0')
        setAdvancePayment('0')
        setExpectedDelivery('')
        setTechnicianId('')
        setTechnicianNotes('')
        router.refresh()
      } catch (err: any) {
        setError(err.message || 'Failed to create repair job card.')
      }
    })
  }

  // Change Status Action
  const handleStatusChange = async (status: JobStatus) => {
    if (!selectedJob) return

    startTransition(async () => {
      try {
        const updated = await updateJobCardStatus(selectedJob.id, status)
        setSelectedJob({ ...selectedJob, status: updated.status })
        router.refresh()
      } catch (e: any) {
        alert(e.message)
      }
    })
  }

  // Update Technician Assignment Action
  const handleAssignTechnician = async (techId: string) => {
    if (!selectedJob) return

    startTransition(async () => {
      try {
        const updated = await updateJobCard(selectedJob.id, {
          brand: selectedJob.brand,
          model: selectedJob.model,
          imei1: selectedJob.imei1 || undefined,
          imei2: selectedJob.imei2 || undefined,
          color: selectedJob.color || undefined,
          storage: selectedJob.storage || undefined,
          issueDescription: selectedJob.issueDescription,
          physicalCondition: selectedJob.physicalCondition,
          accessoriesReceived: selectedJob.accessoriesReceived || undefined,
          estimatedCost: parseFloat(selectedJob.estimatedCost),
          advancePayment: parseFloat(selectedJob.advancePayment),
          expectedDelivery: selectedJob.expectedDelivery || undefined,
          technicianNotes: selectedJob.technicianNotes || undefined,
          status: selectedJob.status,
          technicianId: techId || undefined,
        })
        
        // Find assigned tech name
        const techName = technicians.find(t => t.id === techId)?.name || ''
        setSelectedJob({
          ...selectedJob,
          technicianId: techId || null,
          technician: techId ? { id: techId, name: techName } : null,
        })
        router.refresh()
      } catch (e: any) {
        alert(e.message)
      }
    })
  }

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
      case 'DIAGNOSING':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
      case 'WAITING_PARTS':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
      case 'REPAIRING':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
      case 'READY':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      case 'DELIVERED':
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Repair pipeline list & Search Column */}
      <div className="lg:col-span-2 space-y-4">
        {/* Status filtering bar */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-900 overflow-x-auto">
          {['ALL', 'RECEIVED', 'DIAGNOSING', 'WAITING_PARTS', 'REPAIRING', 'READY', 'DELIVERED'].map((status) => (
            <button
              key={status}
              onClick={() => handleFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {status === 'ALL' ? 'All Jobs' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by job no, device, customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-900 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-xs"
            />
          </form>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/10 flex items-center justify-center space-x-1.5 text-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Intake Device</span>
          </button>
        </div>

        {/* Repair Jobs Cards */}
        <div className="space-y-3">
          {initialJobCards.length > 0 ? (
            initialJobCards.map((job) => {
              const isSelected = selectedJob?.id === job.id
              const due = parseFloat(job.estimatedCost) - parseFloat(job.advancePayment)
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-950 border-slate-900 hover:border-slate-850 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-indigo-400">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{job.jobNo}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold tracking-wider ${getStatusBadge(job.status)}`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-200 text-xs mt-1">
                        {job.brand} {job.model} {job.color && `(${job.color})`}
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-1 flex items-center space-x-2">
                        <User className="h-3 w-3" />
                        <span className="font-medium">{job.customer.name}</span>
                        <span>•</span>
                        <Phone className="h-3 w-3" />
                        <span>{job.customer.mobile}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-between items-end border-t md:border-t-0 border-slate-900 pt-3 md:pt-0">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Est. Cost</span>
                      <p className="font-bold text-white text-xs">₹{parseFloat(job.estimatedCost).toFixed(0)}</p>
                    </div>
                    <div className="text-right md:mt-2">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Due Bal.</span>
                      <p className={`font-bold text-xs ${due > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        ₹{due.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-12 text-center bg-slate-950 border border-slate-900 rounded-2xl">
              <Wrench className="h-8 w-8 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 text-xs">No active repair tickets found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Repairs Detail / Operations Drawer Column */}
      <div className="space-y-4">
        {selectedJob ? (
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-6 animate-slide-up sticky top-20">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-900 pb-4">
              <div>
                <h2 className="text-base font-bold text-white">{selectedJob.jobNo}</h2>
                <span className="text-[10px] text-slate-500 font-medium">Repair Specifications</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-wider ${getStatusBadge(selectedJob.status)}`}>
                {selectedJob.status.replace('_', ' ')}
              </span>
            </div>

            {/* Stepper Status Timeline */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Diagnostic Lifespans</p>
              <div className="space-y-3.5">
                {[
                  { label: 'Intake Received', state: 'RECEIVED', icon: Clock },
                  { label: 'Diagnosing Problem', state: 'DIAGNOSING', icon: Cpu },
                  { label: 'Waiting for Parts', state: 'WAITING_PARTS', icon: AlertTriangle },
                  { label: 'Active Bench Repairing', state: 'REPAIRING', icon: Play },
                  { label: 'Ready for Pickup', state: 'READY', icon: CheckCircle },
                  { label: 'Delivered to Customer', state: 'DELIVERED', icon: Truck },
                ].map((step, idx) => {
                  const states = ['RECEIVED', 'DIAGNOSING', 'WAITING_PARTS', 'REPAIRING', 'READY', 'DELIVERED']
                  const currentIdx = states.indexOf(selectedJob.status)
                  const stepIdx = states.indexOf(step.state)

                  const isDone = stepIdx <= currentIdx
                  const isActive = step.state === selectedJob.status
                  const Icon = step.icon

                  return (
                    <div
                      key={step.state}
                      onClick={() => handleStatusChange(step.state as JobStatus)}
                      className="flex items-center space-x-3 cursor-pointer group text-xs"
                    >
                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center border transition-all ${
                        isActive
                          ? 'bg-indigo-600 border-indigo-500 text-white animate-pulse'
                          : isDone
                          ? 'bg-slate-900 border-slate-850 text-indigo-400'
                          : 'bg-slate-950 border-slate-900 text-slate-650 hover:border-slate-800'
                      }`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className={`font-medium ${isActive ? 'text-indigo-400 font-bold' : isDone ? 'text-slate-300' : 'text-slate-600 group-hover:text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Device details */}
            <div className="border-t border-slate-900 pt-5 space-y-4 text-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Device Matrix</h3>
              <div className="grid grid-cols-2 gap-3 bg-slate-900/40 p-4 border border-slate-900 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Brand & Model</span>
                  <span className="font-semibold text-slate-200">{selectedJob.brand} {selectedJob.model}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Color / Storage</span>
                  <span className="font-semibold text-slate-200">
                    {selectedJob.color || '-'} {selectedJob.storage && `/ ${selectedJob.storage}`}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">IMEI (1 / 2)</span>
                  <span className="font-semibold text-slate-200 font-mono text-[11px] block">{selectedJob.imei1 || 'N/A'}</span>
                  {selectedJob.imei2 && <span className="font-semibold text-slate-250 font-mono text-[11px] block">{selectedJob.imei2}</span>}
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Reported Issue</span>
                  <span className="font-medium text-slate-350">{selectedJob.issueDescription}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Physical State</span>
                  <span className="font-medium text-slate-350">{selectedJob.physicalCondition}</span>
                </div>
                {selectedJob.accessoriesReceived && (
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Accessories Deposited</span>
                    <span className="font-medium text-slate-350">{selectedJob.accessoriesReceived}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Ledger & Tech Allocation */}
            <div className="border-t border-slate-900 pt-5 space-y-4 text-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Allocation & Ledger</h3>
              <div className="space-y-3.5">
                {/* Technician Assignment */}
                {userRole !== 'TECHNICIAN' ? (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assign Technician</label>
                    <select
                      value={selectedJob.technicianId || ''}
                      onChange={(e) => handleAssignTechnician(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none text-xs"
                    >
                      <option value="">Unassigned</option>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name} ({tech.role})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Assigned To</span>
                    <span className="font-semibold text-slate-200">{selectedJob.technician?.name || 'Unassigned'}</span>
                  </div>
                )}

                {/* Billing Summary quick invoice link */}
                <div className="flex justify-between items-center bg-slate-900/30 border border-slate-900 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Total Estimated</span>
                    <span className="font-bold text-white">₹{parseFloat(selectedJob.estimatedCost).toFixed(0)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Advance Paid</span>
                    <span className="font-bold text-emerald-400">₹{parseFloat(selectedJob.advancePayment).toFixed(0)}</span>
                  </div>
                  {/* Bill Now button if status is READY */}
                  {selectedJob.status === 'READY' && (
                    <Link
                      href={`/app/${tenantSlug}/billing?action=new&job=${selectedJob.id}`}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center space-x-1 transition-all"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Bill Now</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-900 border-dashed rounded-2xl p-8 text-center text-slate-500 py-16">
            <Wrench className="h-6 w-6 text-slate-650 mx-auto mb-2" />
            <p className="text-xs">Select a job card visual ticket to review active timelines, device logs, and diagnostic checklists.</p>
          </div>
        )}
      </div>

      {/* Intake Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl w-full max-w-2xl p-6 space-y-6 animate-slide-up relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-850 rounded-xl transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h2 className="text-base font-bold text-white">Device Intake Job Sheet</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter details to register customer devices and issue estimation tickets.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleIntakeDevice} className="space-y-4 text-xs">
              {/* Customer Selector Section */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Client / Owner *</label>
                  <button
                    type="button"
                    onClick={() => setShowQuickCustomerModal(true)}
                    className="text-[10px] text-indigo-400 font-bold hover:underline"
                  >
                    + Register New Customer
                  </button>
                </div>
                <select
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select a Customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.mobile})
                    </option>
                  ))}
                </select>
              </div>

              {/* Device Spec details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-900 pt-4">
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Brand *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Apple, Samsung"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Model *</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. iPhone 13 Pro"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Color</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Graphite"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Storage (GB/TB)</label>
                  <input
                    type="text"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    placeholder="e.g. 128GB"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">IMEI Number 1</label>
                  <input
                    type="text"
                    value={imei1}
                    onChange={(e) => setImei1(e.target.value)}
                    placeholder="15-digit IMEI"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">IMEI Number 2</label>
                  <input
                    type="text"
                    value={imei2}
                    onChange={(e) => setImei2(e.target.value)}
                    placeholder="Alternative IMEI"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Diagnostics & Physical condition checklists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-900 pt-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Issue / Problem Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Specify problems (e.g. cracked display, charging node failure, no power)"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Device Physical State *</label>
                  <input
                    type="text"
                    required
                    value={physicalCondition}
                    onChange={(e) => setPhysicalCondition(e.target.value)}
                    placeholder="e.g. Scratched panel, minor dent on corner"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Accessories Deposited</label>
                  <input
                    type="text"
                    value={accessoriesReceived}
                    onChange={(e) => setAccessoriesReceived(e.target.value)}
                    placeholder="e.g. Charger, SIM Tray, box"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Estimate ledger, Assignment, Delivery */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-900 pt-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Est. Repair Cost (₹)</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Advance Paid (₹)</label>
                  <input
                    type="number"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Expected Collection</label>
                  <input
                    type="date"
                    value={expectedDelivery}
                    onChange={(e) => setExpectedDelivery(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-slate-350 focus:outline-none"
                  />
                </div>
                {userRole !== 'TECHNICIAN' && (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Assign Technician</label>
                    <select
                      value={technicianId}
                      onChange={(e) => setTechnicianId(e.target.value)}
                      className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-900 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'Filing intake...' : 'Create Intake Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Customer modal */}
      {showQuickCustomerModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-sm z-55 p-4">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl w-full max-w-md p-6 space-y-6 animate-slide-up relative">
            <button
              onClick={() => setShowQuickCustomerModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-850 rounded-xl cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h2 className="text-sm font-bold text-white">Quick Register Client</h2>
              <p className="text-[11px] text-slate-550 mt-1">Register customer basic metrics to continue device intake.</p>
            </div>

            {custError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                {custError}
              </div>
            )}

            <form onSubmit={handleQuickCustomer} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={custMobile}
                  onChange={(e) => setCustMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickCustomerModal(false)}
                  className="px-3.5 py-2 bg-slate-900 text-slate-400 font-semibold rounded-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
