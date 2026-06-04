import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/crypto'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        tenantSlug: { label: 'Tenant Slug', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.tenantSlug) {
          throw new Error('Please enter email, password and shop slug.')
        }

        // 1. Verify tenant slug exists
        const tenant = await db.tenant.findUnique({
          where: { slug: credentials.tenantSlug.toLowerCase() },
        })

        if (!tenant) {
          throw new Error('Shop slug not found.')
        }

        // 2. Find user in the tenant database context
        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { tenant: true },
        })

        if (!user || user.tenantId !== tenant.id) {
          throw new Error('Invalid email or password for this shop.')
        }

        // 3. Verify password
        const isValid = verifyPassword(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Invalid email or password.')
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          tenantSlug: user.tenant.slug,
          tenantName: user.tenant.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.tenantId = user.tenantId
        token.tenantSlug = user.tenantSlug
        token.tenantName = user.tenantName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.tenantId = token.tenantId as string
        session.user.tenantSlug = token.tenantSlug as string
        session.user.tenantName = token.tenantName as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
