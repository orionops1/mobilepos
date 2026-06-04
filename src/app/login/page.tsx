'use client'

import React, { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Mail, AlertCircle, ArrowRight, Store, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  React.useEffect(() => {
    if (session?.user) {
      const tenantSlug = (session.user as any).tenantSlug || 'demo-shop'
      console.log('✓ User already logged in, redirecting to:', `/app/${tenantSlug}`)
      router.push(`/app/${tenantSlug}`)
    }
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    console.log('🔐 Attempting login for:', email)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password: password,
      })

      console.log('📝 SignIn result:', result)

      if (result?.error) {
        console.error('❌ Login failed:', result.error)
        setError(result.error)
        setLoading(false)
      } else if (result?.ok) {
        console.log('✅ Login successful!')
        // Wait a moment for session to be set
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Get session to extract tenant slug
        const response = await fetch('/api/auth/session')
        const sessionData = await response.json()
        
        console.log('📦 Session data:', sessionData)
        
        if (sessionData?.user) {
          const tenantSlug = sessionData.user.tenantSlug || 'demo-shop'
          console.log('✓ Redirecting to:', `/app/${tenantSlug}`)
          router.push(`/app/${tenantSlug}`)
        } else {
          console.error('❌ No user in session after login')
          setError('Login succeeded but session not created. Please try again.')
          setLoading(false)
        }
      } else {
        console.error('❌ Unexpected result:', result)
        setError('An unexpected error occurred. Please try again.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('❌ Login exception:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden bg-white">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-gray-200 shadow-lg z-10 relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4 border border-indigo-200">
            <Store className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
            Welcome to Mobile POS
          </h1>
          <p className="text-sm text-gray-600">
            Login to access your mobile repair shop dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-700 text-sm animate-fade-in">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. owner@mobilepos.com"
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-gray-600">
              Demo: <span className="text-indigo-600 font-semibold">owner@mobilepos.com</span> • Pass: <span className="text-indigo-600 font-semibold">password123</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors"
            >
              Create One
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500 z-10">
        © 2026 Mobile POS System. All rights reserved.
      </div>
    </div>
  )
}
