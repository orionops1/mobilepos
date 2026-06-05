import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { shopName, email, password, confirmPassword } = body

    // Validation
    if (!shopName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use.' },
        { status: 400 }
      )
    }

    // Create slug from shop name
    const slug = shopName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Check if slug already exists
    const existingTenant = await db.tenant.findUnique({
      where: { slug },
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Shop name is already taken. Please choose another name.' },
        { status: 400 }
      )
    }

    // Create tenant
    const tenant = await db.tenant.create({
      data: {
        name: shopName,
        slug,
        currency: 'INR',
        taxRate: 18.0,
      },
    })

    // Hash password and create admin user
    const hashedPassword = hashPassword(password)

    const user = await db.user.create({
      data: {
        name: 'Admin',
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'OWNER',
        tenantId: tenant.id,
      },
    })

    return NextResponse.json(
      {
        message: 'Account created successfully!',
        tenantSlug: tenant.slug,
        email: user.email,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred during registration.' },
      { status: 500 }
    )
  }
}
