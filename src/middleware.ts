import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Protect all /app routes
  if (path.startsWith('/app')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      // Redirect to login if not authenticated
      const url = new URL('/login', request.url)
      const segments = path.split('/')
      if (segments.length >= 3) {
        url.searchParams.set('tenant', segments[2])
      }
      return NextResponse.redirect(url)
    }

    // Authenticated, check tenant slug matches
    const segments = path.split('/')
    if (segments.length >= 3) {
      const routeSlug = segments[2].toLowerCase()
      const userSlug = (token.tenantSlug as string || '').toLowerCase()

      if (routeSlug !== userSlug) {
        // Redirect to their own tenant dashboard if trying to access another tenant
        return NextResponse.redirect(new URL(`/app/${userSlug}`, request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*'],
}
