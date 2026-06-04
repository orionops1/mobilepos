'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  Wrench,
  Receipt,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Shield,
  Smartphone
} from 'lucide-react'

interface SidebarProps {
  tenant: {
    slug: string
    name: string
    logoUrl?: string | null
  }
  user: {
    name: string
    email: string
    role: string
  }
}

export default function Sidebar({ tenant, user }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Navigation Links definition with permission mapping
  const allLinks = [
    {
      name: 'Dashboard',
      href: `/app/${tenant.slug}`,
      icon: LayoutDashboard,
      roles: ['OWNER', 'MANAGER', 'CASHIER'],
    },
    {
      name: 'Customers',
      href: `/app/${tenant.slug}/customers`,
      icon: Users,
      roles: ['OWNER', 'MANAGER', 'CASHIER'],
    },
    {
      name: 'Repair Jobs',
      href: `/app/${tenant.slug}/repairs`,
      icon: Wrench,
      roles: ['OWNER', 'MANAGER', 'TECHNICIAN'],
    },
    {
      name: 'Billing & Sales',
      href: `/app/${tenant.slug}/billing`,
      icon: Receipt,
      roles: ['OWNER', 'MANAGER', 'CASHIER'],
    },
    {
      name: 'Inventory',
      href: `/app/${tenant.slug}/inventory`,
      icon: Package,
      roles: ['OWNER', 'MANAGER', 'CASHIER'],
    },
    {
      name: 'Reports',
      href: `/app/${tenant.slug}/reports`,
      icon: BarChart3,
      roles: ['OWNER', 'MANAGER'],
    },
    {
      name: 'Settings',
      href: `/app/${tenant.slug}/settings`,
      icon: Settings,
      roles: ['OWNER', 'MANAGER'],
    },
  ]

  // Filter links based on user role
  const links = allLinks.filter((link) => link.roles.includes(user.role))

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between py-6">
      <div className="px-4">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="p-2 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <h2 className="font-bold text-white leading-none text-sm">{tenant.name}</h2>
              <span className="text-[10px] text-indigo-400 font-medium">Repair POS</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon
            // Dashboard link matches exactly, other links match subpaths
            const isActive =
              link.name === 'Dashboard'
                ? pathname === link.href
                : pathname.startsWith(link.href)

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {!collapsed && <span className="truncate">{link.name}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User Info & Log Out */}
      <div className="px-4 border-t border-slate-900 pt-6 space-y-4">
        {!collapsed && (
          <div className="flex items-center space-x-3 px-2">
            <div className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
              <Shield className="h-4.5 w-4.5 text-indigo-400" />
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white leading-none">{user.name}</p>
              <span className="text-[10px] text-slate-500 font-medium uppercase mt-0.5 inline-block">
                {user.role}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-950/20 hover:text-rose-400 transition-all group cursor-pointer"
        >
          <LogOut className="h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-rose-400" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-white hover:bg-slate-800 cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
        ></div>
      )}

      {/* Mobile Drawer Panel */}
      <div
        className={`lg:hidden fixed top-0 bottom-0 left-0 w-64 bg-slate-950 border-r border-slate-900 z-40 transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>

      {/* Desktop Sidebar (Collapsible) */}
      <div
        className={`hidden lg:flex flex-col bg-slate-950 border-r border-slate-900 transition-all duration-300 relative ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer z-50 shadow-md"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>
    </>
  )
}
