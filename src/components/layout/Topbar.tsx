'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bell,
  Plus,
  Search,
  User,
  Wrench,
  Receipt,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react'
import { getLowStockItems } from '@/app/actions/inventory'

interface TopbarProps {
  tenant: {
    slug: string
    name: string
  }
  user: {
    name: string
    role: string
  }
}

export default function Topbar({ tenant, user }: TopbarProps) {
  const [currentTime, setCurrentTime] = useState('')
  const [lowStockCount, setLowStockCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showQuickMenu, setShowQuickMenu] = useState(false)

  // Clock ticks
  useEffect(() => {
    const updateTime = () => {
      const date = new Date()
      setCurrentTime(
        date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }) +
          ' • ' +
          date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 60000)
    return () => clearInterval(timer)
  }, [])

  // Check low stock
  useEffect(() => {
    const checkStock = async () => {
      try {
        if (user.role !== 'TECHNICIAN') {
          const items = await getLowStockItems()
          setLowStockCount(items.length)
        }
      } catch (e) {
        // Safe catch if not authenticated/errors
      }
    }
    checkStock()
  }, [user.role])

  return (
    <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Search / Breadcrumbs */}
      <div className="flex items-center space-x-4 pl-8 lg:pl-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center space-x-1.5">
          <Sparkles className="h-3 w-3 text-indigo-400" />
          <span>{tenant.name}</span>
        </span>
      </div>

      {/* Right Side Options */}
      <div className="flex items-center space-x-3.5">
        {/* Current Time Clock */}
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-900/50 border border-slate-850 px-3 py-1.5 rounded-xl font-medium">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span>{currentTime}</span>
        </div>

        {/* Quick Actions Dropdown (Only for Owners, Managers, Cashiers) */}
        {user.role !== 'TECHNICIAN' && (
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Quick Action</span>
            </button>

            {showQuickMenu && (
              <>
                <div
                  onClick={() => setShowQuickMenu(false)}
                  className="fixed inset-0 z-40"
                ></div>
                <div className="absolute right-0 mt-2.5 w-48 rounded-xl bg-slate-950 border border-slate-900 p-1.5 shadow-2xl z-50 animate-slide-down">
                  <Link
                    href={`/app/${tenant.slug}/repairs?action=new`}
                    onClick={() => setShowQuickMenu(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-350 hover:bg-slate-900 hover:text-white transition-all"
                  >
                    <Wrench className="h-4.5 w-4.5 text-slate-400" />
                    <span>Intake Device (Job)</span>
                  </Link>
                  <Link
                    href={`/app/${tenant.slug}/billing?action=new`}
                    onClick={() => setShowQuickMenu(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-350 hover:bg-slate-900 hover:text-white transition-all"
                  >
                    <Receipt className="h-4.5 w-4.5 text-slate-400" />
                    <span>Create Invoice (Bill)</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* Alerts / Notifications */}
        {user.role !== 'TECHNICIAN' && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-900 rounded-xl transition-all relative cursor-pointer"
            >
              <Bell className="h-4.5 w-4.5" />
              {lowStockCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  onClick={() => setShowNotifications(false)}
                  className="fixed inset-0 z-40"
                ></div>
                <div className="absolute right-0 mt-2.5 w-72 rounded-xl bg-slate-950 border border-slate-900 p-3 shadow-2xl z-50 animate-slide-down">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2 mb-2">
                    Alerts & Notifications
                  </h4>
                  {lowStockCount > 0 ? (
                    <div className="flex items-start space-x-2.5 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300">
                      <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Low Stock Warning</p>
                        <p className="text-[10px] text-rose-400/90 mt-0.5">
                          {lowStockCount} items have fallen below their minimum stock levels.
                        </p>
                        <Link
                          href={`/app/${tenant.slug}/inventory?filter=low`}
                          onClick={() => setShowNotifications(false)}
                          className="text-[10px] underline font-bold text-rose-300 mt-2 inline-block"
                        >
                          Refill Stock
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-4">No active alerts.</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* User Badge */}
        <div className="flex items-center space-x-2 border-l border-slate-900 pl-3.5">
          <div className="h-8.5 w-8.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center">
            <User className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <div className="hidden lg:block truncate max-w-[100px]">
            <p className="text-xs font-bold text-white leading-none truncate">{user.name}</p>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider leading-none mt-1 inline-block">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
