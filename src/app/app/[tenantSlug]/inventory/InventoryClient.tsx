'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  Tag,
  PlusCircle,
  MinusCircle,
  Edit2,
  X,
  CheckCircle,
  Truck,
  DollarSign
} from 'lucide-react'
import { createInventoryItem, updateInventoryItem, adjustStock } from '@/app/actions/inventory'

interface InventoryItem {
  id: string
  name: string
  sku: string | null
  category: string
  quantity: number
  minStockLevel: number
  purchaseCost: any
  sellingPrice: any
  supplierName: string | null
  supplierContact: string | null
}

interface InventoryClientProps {
  initialItems: InventoryItem[]
  categories: string[]
  tenantSlug: string
  userRole: string
  filterType: string
}

export default function InventoryClient({
  initialItems,
  categories,
  tenantSlug,
  userRole,
  filterType
}: InventoryClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  
  // Selected item state
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Forms state
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('')
  const [quantity, setQuantity] = useState('0')
  const [minStock, setMinStock] = useState('5')
  const [purchaseCost, setPurchaseCost] = useState('0')
  const [sellingPrice, setSellingPrice] = useState('0')
  const [supplierName, setSupplierName] = useState('')
  const [supplierContact, setSupplierContact] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Adjust stock state
  const [adjustType, setAdjustType] = useState<'STOCK_IN' | 'STOCK_OUT'>('STOCK_IN')
  const [adjustQty, setAdjustQty] = useState('1')
  const [adjustNote, setAdjustNote] = useState('')

  // Permissions check
  const isTechnician = userRole === 'TECHNICIAN'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    let url = `/app/${tenantSlug}/inventory?q=${encodeURIComponent(searchQuery)}`
    if (categoryFilter !== 'ALL') url += `&category=${categoryFilter}`
    if (filterType === 'low') url += `&filter=low`
    router.push(url)
  }

  const handleFilterCategory = (cat: string) => {
    setCategoryFilter(cat)
    let url = `/app/${tenantSlug}/inventory`
    const params = []
    if (cat !== 'ALL') params.push(`category=${cat}`)
    if (searchQuery) params.push(`q=${encodeURIComponent(searchQuery)}`)
    if (filterType === 'low') params.push(`filter=low`)
    if (params.length > 0) url += `?${params.join('&')}`
    router.push(url)
  }

  // Pre-fill Edit form
  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item)
    setName(item.name)
    setSku(item.sku || '')
    setCategory(item.category)
    setMinStock(item.minStockLevel.toString())
    setPurchaseCost(parseFloat(item.purchaseCost).toString())
    setSellingPrice(parseFloat(item.sellingPrice).toString())
    setSupplierName(item.supplierName || '')
    setSupplierContact(item.supplierContact || '')
    setError(null)
    setShowEditModal(true)
  }

  // Prefill Adjust stock form
  const openAdjustModal = (item: InventoryItem) => {
    setSelectedItem(item)
    setAdjustQty('1')
    setAdjustNote('')
    setError(null)
    setShowAdjustModal(true)
  }

  // Create Inventory Action
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        await createInventoryItem({
          name,
          sku: sku || undefined,
          category,
          quantity: parseInt(quantity) || 0,
          minStockLevel: parseInt(minStock) || 5,
          purchaseCost: parseFloat(purchaseCost) || 0,
          sellingPrice: parseFloat(sellingPrice) || 0,
          supplierName,
          supplierContact,
        })
        setShowAddModal(false)
        router.refresh()
      } catch (err: any) {
        setError(err.message || 'Failed to create inventory item.')
      }
    })
  }

  // Update Inventory Action
  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return
    setError(null)

    startTransition(async () => {
      try {
        await updateInventoryItem(selectedItem.id, {
          name,
          sku: sku || undefined,
          category,
          minStockLevel: parseInt(minStock) || 5,
          purchaseCost: parseFloat(purchaseCost) || 0,
          sellingPrice: parseFloat(sellingPrice) || 0,
          supplierName,
          supplierContact,
        })
        setShowEditModal(false)
        router.refresh()
      } catch (err: any) {
        setError(err.message || 'Failed to update inventory item.')
      }
    })
  }

  // Adjust stock action
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return
    setError(null)

    startTransition(async () => {
      try {
        await adjustStock(
          selectedItem.id,
          adjustType,
          parseInt(adjustQty) || 1,
          adjustNote
        )
        setShowAdjustModal(false)
        router.refresh()
      } catch (err: any) {
        setError(err.message || 'Failed to adjust stock level.')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Category Selection Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category filters */}
        <div className="flex gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-900 overflow-x-auto">
          {['ALL', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Low Stock Alerts trigger toggle */}
        <button
          onClick={() => {
            const nextFilter = filterType === 'low' ? '' : 'low'
            router.push(`/app/${tenantSlug}/inventory?filter=${nextFilter}`)
          }}
          className={`px-3 py-2 border rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer ${
            filterType === 'low'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-455 hover:bg-rose-500/20'
              : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Low Stock Alerts Only</span>
        </button>
      </div>

      {/* Search Input and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by part name, category, SKU, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-900 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-xs"
          />
        </form>
        {!isTechnician && (
          <button
            onClick={() => {
              setName('')
              setSku('')
              setCategory('')
              setQuantity('10')
              setMinStock('5')
              setPurchaseCost('0')
              setSellingPrice('0')
              setSupplierName('')
              setSupplierContact('')
              setError(null)
              setShowAddModal(true)
            }}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/10 flex items-center justify-center space-x-1.5 text-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Stock Item</span>
          </button>
        )}
      </div>

      {/* Inventory Items Table */}
      <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 font-semibold bg-slate-900/10">
                <th className="p-4">Item Name / Category</th>
                <th className="p-4">SKU Code</th>
                <th className="p-4">Quantity / Status</th>
                {!isTechnician && <th className="p-4">Cost Prices</th>}
                <th className="p-4">Selling Price</th>
                {!isTechnician && <th className="p-4">Supplier</th>}
                {!isTechnician && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50">
              {initialItems.length > 0 ? (
                initialItems.map((item) => {
                  const isLowStock = item.quantity <= item.minStockLevel
                  return (
                    <tr key={item.id} className="text-slate-350 hover:text-white hover:bg-slate-900/10 transition-all">
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-white text-xs">{item.name}</p>
                          <span className="text-[10px] text-slate-500 font-medium">{item.category}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-medium text-[11px] text-slate-450">{item.sku || 'N/A'}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold text-xs ${isLowStock ? 'text-rose-455' : 'text-slate-200'}`}>
                            {item.quantity} units
                          </span>
                          {isLowStock && (
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider bg-rose-500/10 text-rose-450 border border-rose-500/20 flex items-center space-x-0.5">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              <span>LOW STOCK</span>
                            </span>
                          )}
                        </div>
                      </td>
                      {!isTechnician && (
                        <td className="p-4 font-bold text-slate-350">Rs {parseFloat(item.purchaseCost).toFixed(0)}</td>
                      )}
                      <td className="p-4 font-bold text-white">Rs {parseFloat(item.sellingPrice).toFixed(0)}</td>
                      {!isTechnician && (
                        <td className="p-4">
                          {item.supplierName ? (
                            <div>
                              <p className="font-medium text-slate-350">{item.supplierName}</p>
                              {item.supplierContact && <span className="text-[9px] text-slate-550 block font-mono">{item.supplierContact}</span>}
                            </div>
                          ) : (
                            <span className="text-slate-650 italic">None</span>
                          )}
                        </td>
                      )}
                      {!isTechnician && (
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openAdjustModal(item)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-indigo-400 font-bold rounded-lg text-[10px] tracking-wider transition-all"
                            >
                              Restock
                            </button>
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 text-slate-450 hover:text-white bg-slate-900 border border-slate-850 rounded-lg"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No parts inventory matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl w-full max-w-lg p-6 space-y-6 animate-slide-up relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-850 rounded-xl cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h2 className="text-base font-bold text-white">Register Spare Part / Accessories</h2>
              <p className="text-xs text-slate-500 mt-1">Configure catalogs and default buying margins.</p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Part Name / Description *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. iPhone 13 LCD Screen Replacement"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">SKU / Barcode Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Optional SKU (e.g. SCR-IP13)"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Category *</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="LCD Screen, Battery, charging node"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Initial Qty Intake</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Min. Stock Level Alert</label>
                  <input
                    type="number"
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Supplier Purchase Cost (Rs )</label>
                  <input
                    type="number"
                    required
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Retail Selling Price (Rs )</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Supplier Name</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. Metro Accessories"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Supplier Contact Number</label>
                  <input
                    type="text"
                    value={supplierContact}
                    onChange={(e) => setSupplierContact(e.target.value)}
                    placeholder="e.g. +91 99999 88888"
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
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
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl cursor-pointer shadow-lg"
                >
                  {isPending ? 'Filing catalog...' : 'Add Spare Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl w-full max-w-lg p-6 space-y-6 animate-slide-up relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-850 rounded-xl cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h2 className="text-base font-bold text-white">Modify Catalog Parameters</h2>
              <p className="text-xs text-slate-500 mt-1">Update description details and cost margins.</p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Part Name / Description *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">SKU / Barcode Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Category *</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Min. Stock Level Alert</label>
                  <input
                    type="number"
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Supplier Purchase Cost (Rs )</label>
                  <input
                    type="number"
                    required
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Retail Selling Price (Rs )</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Supplier Name</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Supplier Contact Number</label>
                  <input
                    type="text"
                    value={supplierContact}
                    onChange={(e) => setSupplierContact(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-900 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl cursor-pointer shadow-lg"
                >
                  {isPending ? 'Saving modifications...' : 'Save Catalog Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Restock Modal */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl w-full max-w-sm p-6 space-y-6 animate-slide-up relative">
            <button
              onClick={() => setShowAdjustModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-850 rounded-xl cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h2 className="text-sm font-bold text-white">Record Stock Inventory Update</h2>
              <p className="text-[11px] text-slate-550 mt-1">Adjust count metrics for: <span className="text-white font-semibold">{selectedItem.name}</span></p>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 text-[11px] rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              <div className="flex bg-slate-900 border border-slate-850 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAdjustType('STOCK_IN')}
                  className={`flex-1 py-2 font-bold rounded-lg text-[10px] tracking-wide uppercase transition-all cursor-pointer ${
                    adjustType === 'STOCK_IN' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Restock In (+)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('STOCK_OUT')}
                  className={`flex-1 py-2 font-bold rounded-lg text-[10px] tracking-wide uppercase transition-all cursor-pointer ${
                    adjustType === 'STOCK_OUT' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Stock Out (-)
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Adjustment Count *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">Adjustment Note / Cause *</label>
                <input
                  type="text"
                  required
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. Refill from supplier Metro / Stock damaged"
                  className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-white focus:outline-none animate-fade-in"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-3.5 py-2 bg-slate-900 text-slate-400 font-semibold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{isPending ? 'Logging adjust...' : 'Apply Update'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
