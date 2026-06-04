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
      },
      async authorize(credentials) {
        console.log('🔐 Login attempt for:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.error('❌ Missing credentials')
          throw new Error('Please enter email and password.')
        }

        try {
          // Find user by email
          const user = await db.user.findUnique({
            where: { email: credentials.email.toLowerCase().trim() },
            include: { tenant: true },
          })

          if (!user) {
            console.error('❌ User not found:', credentials.email)
            throw new Error('Invalid email or password.')
          }

          console.log('✓ User found:', user.email, '- Role:', user.role)

          // Verify password
          const isValid = verifyPassword(credentials.password, user.password)
          
          if (!isValid) {
            console.error('❌ Invalid password for:', user.email)
            throw new Error('Invalid email or password.')
          }

          console.log('✓ Password verified for:', user.email)
          console.log('✓ Tenant:', user.tenant.name, '(slug:', user.tenant.slug, ')')

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            tenantSlug: user.tenant.slug,
            tenantName: user.tenant.name,
          }
        } catch (error) {
          console.error('❌ Auth error:', error)
          if (error instanceof Error) {
            throw error
          }
          throw new Error('An error occurred during authentication.')
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
        console.log('✓ JWT created for:', user.email)
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
        console.log('✓ Session created for:', session.user.email)
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
