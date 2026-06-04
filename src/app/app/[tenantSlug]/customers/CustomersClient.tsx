'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Wrench,
  Edit2,
  Trash2,
  X,
  History,
  TrendingUp,
  Receipt
} from 'lucide-react'
import { createCustomer, updateCustomer, deleteCustomer, getCustomerById } from '@/app/actions/customers'

interface Customer {
  id: string
  name: string
  mobile: string
  alternateMobile: string | null
  email: string | null
  address: string | null
  notes: string | null
  createdAt: Date
}

interface CustomersClientProps {
  initialCustomers: Customer[]
  tenantSlug: string
}

export default function CustomersClient({ initialCustomers, tenantSlug }: CustomersClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  // Forms state
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [altMobile, setAltMobile] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/app/${tenantSlug}/customers?q=${encodeURIComponent(searchQuery)}`)
  }

  // Fetch complete details including history when a customer is clicked
  const handleSelectCustomer = async (cust: Customer) => {
    setLoadingHistory(true)
    setSelectedCustomer(cust)
    try {
      const fullDetails = await getCustomerById(cust.id)
      setSelectedCustomer(fullDetails)
    } catch (e) {
      // Fallback
    } finally {
      setLoadingHistory(false)
    }
  }

  // Open Edit Modal and prefill form
  const openEditModal = (cust: Customer) => {
    setName(cust.name)
    setMobile(cust.mobile)
    setAltMobile(cust.alternateMobile || '')
    setEmail(cust.email || '')
    setAddress(cust.address || '')
    setNotes(cust.notes || '')
    setError(null)
    setShowEditModal(true)
  }

  // Open Add Modal
  const openAddModal = () => {
    setName('')
    setMobile('')
    setAltMobile('')
    setEmail('')
    setAddress('')
    setNotes('')
    setError(null)
    setShowAddModal(true)
  }

  // Add Action
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    startTransition(async () => {
      try {
        await createCustomer({
          name,
          mobile,
          alternateMobile: altMobile,
          email,
          address,
          notes,
        })
        setShowAddModal(false)
        router.refresh()
      } catch (err: any) {
        setError(err.message || 'Failed to create customer.')
      }
    })
  }

  // Edit Action
  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return
    setError(null)

    startTransition(async () => {
      try {
        await updateCustomer(selectedCustomer.id, {
          name,
          mobile,
          alternateMobile: altMobile,
          email,
          address,
          notes,
        })
        setShowEditModal(false)
        // Refresh detail views
        const updatedDetails = await getCustomerById(selectedCustomer.id)
        setSelectedCustomer(updatedDetails)
        router.refresh()
      } catch (err: any) {
        setError(err.message || 'Failed to update customer.')
      }
    })
  }

  // Delete Action
  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer? All their history logs will be detached.')) return
    
    startTransition(async () => {
      try {
        await deleteCustomer(id)
        setSelectedCustomer(null)
        router.refresh()
      } catch (err: any) {
        alert(err.message || 'Failed to delete customer.')
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Customers List & Search Column */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search & Actions Topbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, mobile number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-900 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-xs"
            />
          </form>
          <button
            onClick={openAddModal}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/10 flex items-center justify-center space-x-1.5 text-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </div>

        {/* Customer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialCustomers.length > 0 ? (
            initialCustomers.map((cust) => {
              const isSelected = selectedCustomer?.id === cust.id
              return (
                <div
                  key={cust.id}
                  onClick={() => handleSelectCustomer(cust)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-44 ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-950 border-slate-900 hover:border-slate-850 hover:bg-slate-900/40'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-white text-sm">{cust.name}</h3>
                      <div className="h-7 w-7 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-500">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="space-y-1.5 mt-4">
                      <p className="text-xs text-slate-400 flex items-center space-x-1.5">
                        <Phone className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{cust.mobile}</span>
                      </p>
                      {cust.email && (
                        <p className="text-xs text-slate-400 flex items-center space-x-1.5 truncate">
                          <Mail className="h-3.5 w-3.5 text-slate-500" />
                          <span className="truncate">{cust.email}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-slate-900/50 pt-2 flex justify-between items-center">
                    <span>Joined: {new Date(cust.createdAt).toLocaleDateString()}</span>
                    <span className="text-indigo-400 font-bold hover:underline">View History →</span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-2 p-12 text-center bg-slate-950 border border-slate-900 rounded-2xl">
              <User className="h-8 w-8 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 text-xs">No customers found.</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  router.push(`/app/${tenantSlug}/customers`)
                }}
                className="text-xs text-indigo-400 font-semibold hover:underline mt-2"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Drawer Column */}
      <div className="space-y-4">
        {selectedCustomer ? (
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-6 animate-slide-up sticky top-20">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-slate-900 pb-4">
              <div>
                <h2 className="text-base font-bold text-white">{selectedCustomer.name}</h2>
                <span className="text-[10px] text-slate-500 font-medium">Customer Profile</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(selectedCustomer)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                  className="p-2 text-rose-400 hover:bg-rose-950/20 bg-slate-900 border border-slate-850 hover:border-rose-950/50 rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Profile Meta Cards */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center space-x-3 text-slate-350">
                <Phone className="h-4 w-4 text-indigo-400" />
                <span>{selectedCustomer.mobile}</span>
              </div>
              {selectedCustomer.alternateMobile && (
                <div className="flex items-center space-x-3 text-slate-350 pl-7">
                  <span className="text-[10px] text-slate-500">Alt:</span>
                  <span>{selectedCustomer.alternateMobile}</span>
                </div>
              )}
              {selectedCustomer.email && (
                <div className="flex items-center space-x-3 text-slate-350">
                  <Mail className="h-4 w-4 text-slate-550" />
                  <span className="truncate">{selectedCustomer.email}</span>
                </div>
              )}
              {selectedCustomer.address && (
                <div className="flex items-start space-x-3 text-slate-350">
                  <MapPin className="h-4 w-4 text-slate-550 flex-shrink-0 mt-0.5" />
                  <span>{selectedCustomer.address}</span>
                </div>
              )}
              {selectedCustomer.notes && (
                <div className="bg-slate-900/50 border border-slate-900 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Internal Notes</p>
                  <p className="text-[11px] text-slate-400">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>

            {/* Invoices and Job Cards lists */}
            <div className="space-y-4 border-t border-slate-900 pt-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <History className="h-4 w-4 text-indigo-400" />
                <span>History log</span>
              </h3>

              {loadingHistory ? (
                <div className="py-8 text-center">
                  <div className="h-6 w-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Job Cards */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Device Repairs</span>
                      <span className="text-[10px] font-bold text-slate-350 bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                        {selectedCustomer.jobCards?.length || 0} Jobs
                      </span>
                    </div>
                    {selectedCustomer.jobCards?.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {selectedCustomer.jobCards.map((job: any) => (
                          <div key={job.id} className="p-2.5 bg-slate-900/50 border border-slate-900 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-white">{job.jobNo}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{job.brand} {job.model}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider ${
                              job.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                            }`}>
                              {job.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic py-1">No repair intake history.</p>
                    )}
                  </div>

                  {/* Previous Bills */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Previous Invoices</span>
                      <span className="text-[10px] font-bold text-slate-350 bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                        {selectedCustomer.invoices?.length || 0} Bills
                      </span>
                    </div>
                    {selectedCustomer.invoices?.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {selectedCustomer.invoices.map((inv: any) => (
                          <div key={inv.id} className="p-2.5 bg-slate-900/50 border border-slate-900 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-white">{inv.invoiceNo}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{new Date(inv.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white">₹{Number(inv.grandTotal).toFixed(0)}</p>
                              <span className={`text-[8px] font-bold tracking-wider ${
                                inv.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'
                              }`}>
                                {inv.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic py-1">No billing history.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-900 border-dashed rounded-2xl p-8 text-center text-slate-500 py-16">
            <FileText className="h-6 w-6 text-slate-650 mx-auto mb-2" />
            <p className="text-xs">Select a customer profile to view metadata, job sheets, and invoice history.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modals */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl w-full max-w-lg p-6 space-y-6 animate-slide-up relative">
            <button
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-850 rounded-xl transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h2 className="text-base font-bold text-white">
                {showAddModal ? 'Register New Customer' : 'Edit Customer Information'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter details to manage communications and transaction logs.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={showAddModal ? handleAddCustomer : handleEditCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Alternate Mobile</label>
                  <input
                    type="tel"
                    value={altMobile}
                    onChange={(e) => setAltMobile(e.target.value)}
                    placeholder="Optional alternative"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Address</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full residential or billing address"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Internal technician or cashier notes"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-900 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                  }}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'Saving...' : showAddModal ? 'Create Profile' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
