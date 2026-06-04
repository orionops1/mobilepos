import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Use the same PBKDF2 hashing as src/lib/crypto.ts
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

async function main() {
  console.log('🌱 Seeding database...')

  // Create a demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-shop' },
    update: {},
    create: {
      name: 'Demo Mobile Repair Shop',
      slug: 'demo-shop',
      address: '123 Main Street, Tech City, TC 12345',
      phone: '+1-555-0123',
      email: 'contact@demoshop.com',
      website: 'https://demoshop.com',
      taxNumber: 'GST123456789',
      currency: 'INR',
      taxRate: 18.0,
      qrCodeData: 'upi://pay?pa=shop@upi&pn=DemoShop',
    },
  })

  console.log('✅ Created tenant:', tenant.name)

  // Create users
  const passwordHash = hashPassword('password123')

  const owner = await prisma.user.upsert({
    where: { email: 'owner@mobilepos.com' },
    update: {},
    create: {
      name: 'Shop Owner',
      email: 'owner@mobilepos.com',
      password: passwordHash,
      role: 'OWNER',
      tenantId: tenant.id,
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'manager@mobilepos.com' },
    update: {},
    create: {
      name: 'Shop Manager',
      email: 'manager@mobilepos.com',
      password: passwordHash,
      role: 'MANAGER',
      tenantId: tenant.id,
    },
  })

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@mobilepos.com' },
    update: {},
    create: {
      name: 'Cashier',
      email: 'cashier@mobilepos.com',
      password: passwordHash,
      role: 'CASHIER',
      tenantId: tenant.id,
    },
  })

  const technician = await prisma.user.upsert({
    where: { email: 'technician@mobilepos.com' },
    update: {},
    create: {
      name: 'Lead Technician',
      email: 'technician@mobilepos.com',
      password: passwordHash,
      role: 'TECHNICIAN',
      tenantId: tenant.id,
    },
  })

  console.log('✅ Created users: Owner, Manager, Cashier, Technician')

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { tenantId_mobile: { tenantId: tenant.id, mobile: '9876543210' } },
      update: {},
      create: {
        name: 'Rajesh Kumar',
        mobile: '9876543210',
        alternateMobile: '9876543211',
        email: 'rajesh@example.com',
        address: '456 Park Avenue, Tech City',
        notes: 'VIP Customer - Priority Service',
        tenantId: tenant.id,
      },
    }),
    prisma.customer.upsert({
      where: { tenantId_mobile: { tenantId: tenant.id, mobile: '9123456780' } },
      update: {},
      create: {
        name: 'Priya Sharma',
        mobile: '9123456780',
        email: 'priya@example.com',
        address: '789 Tech Boulevard',
        tenantId: tenant.id,
      },
    }),
    prisma.customer.upsert({
      where: { tenantId_mobile: { tenantId: tenant.id, mobile: '9988776655' } },
      update: {},
      create: {
        name: 'Amit Patel',
        mobile: '9988776655',
        alternateMobile: '9988776656',
        address: '321 Innovation Drive',
        tenantId: tenant.id,
      },
    }),
  ])

  console.log('✅ Created sample customers:', customers.length)

  // Create inventory items
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: 'LCD-IP13-BLK' } },
      update: {},
      create: {
        name: 'iPhone 13 LCD Screen - Black',
        sku: 'LCD-IP13-BLK',
        category: 'LCD Screens',
        quantity: 15,
        minStockLevel: 5,
        purchaseCost: 4500,
        sellingPrice: 6500,
        supplierName: 'Tech Parts Supplier',
        supplierContact: '+91-9876543210',
        tenantId: tenant.id,
      },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: 'BAT-S21-OEM' } },
      update: {},
      create: {
        name: 'Samsung S21 Battery - OEM',
        sku: 'BAT-S21-OEM',
        category: 'Batteries',
        quantity: 20,
        minStockLevel: 10,
        purchaseCost: 800,
        sellingPrice: 1200,
        supplierName: 'Battery World',
        supplierContact: '+91-9123456789',
        tenantId: tenant.id,
      },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: 'PORT-USBC-GEN' } },
      update: {},
      create: {
        name: 'USB-C Charging Port - Generic',
        sku: 'PORT-USBC-GEN',
        category: 'Charging Ports',
        quantity: 30,
        minStockLevel: 15,
        purchaseCost: 150,
        sellingPrice: 350,
        supplierName: 'Mobile Parts Ltd',
        tenantId: tenant.id,
      },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: 'GLASS-TEMP-9H' } },
      update: {},
      create: {
        name: 'Tempered Glass Screen Protector - 9H',
        sku: 'GLASS-TEMP-9H',
        category: 'Accessories',
        quantity: 50,
        minStockLevel: 20,
        purchaseCost: 50,
        sellingPrice: 150,
        supplierName: 'Glass Protection Co',
        tenantId: tenant.id,
      },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: 'CASE-SIL-CLR' } },
      update: {},
      create: {
        name: 'Silicone Case - Clear',
        sku: 'CASE-SIL-CLR',
        category: 'Accessories',
        quantity: 40,
        minStockLevel: 20,
        purchaseCost: 80,
        sellingPrice: 200,
        supplierName: 'Case Masters',
        tenantId: tenant.id,
      },
    }),
  ])

  console.log('✅ Created inventory items:', inventoryItems.length)

  // Create sample job cards
  const jobCards = await Promise.all([
    prisma.jobCard.create({
      data: {
        jobNo: 'JOB-1001',
        tenantId: tenant.id,
        customerId: customers[0].id,
        brand: 'Apple',
        model: 'iPhone 13 Pro',
        imei1: '123456789012345',
        imei2: '123456789012346',
        color: 'Pacific Blue',
        storage: '256GB',
        issueDescription: 'Screen cracked after drop. Touch not responding on left side.',
        physicalCondition: 'Minor scratches on back. Camera module intact.',
        accessoriesReceived: 'Original charger, case',
        estimatedCost: 7500,
        advancePayment: 2000,
        expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        technicianNotes: 'Need to replace LCD and digitizer assembly',
        status: 'REPAIRING',
        technicianId: technician.id,
      },
    }),
    prisma.jobCard.create({
      data: {
        jobNo: 'JOB-1002',
        tenantId: tenant.id,
        customerId: customers[1].id,
        brand: 'Samsung',
        model: 'Galaxy S21',
        imei1: '987654321098765',
        color: 'Phantom Gray',
        storage: '128GB',
        issueDescription: 'Battery draining very fast. Phone getting hot.',
        physicalCondition: 'Good condition, no physical damage',
        accessoriesReceived: 'Charger',
        estimatedCost: 1500,
        advancePayment: 500,
        expectedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        technicianNotes: 'Battery health at 65%. Replacement recommended.',
        status: 'DIAGNOSING',
        technicianId: technician.id,
      },
    }),
    prisma.jobCard.create({
      data: {
        jobNo: 'JOB-1003',
        tenantId: tenant.id,
        customerId: customers[2].id,
        brand: 'OnePlus',
        model: 'OnePlus 9 Pro',
        imei1: '456789123456789',
        color: 'Morning Mist',
        storage: '256GB',
        issueDescription: 'Not charging. USB port loose.',
        physicalCondition: 'Excellent condition',
        estimatedCost: 800,
        advancePayment: 0,
        expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'RECEIVED',
      },
    }),
  ])

  console.log('✅ Created job cards:', jobCards.length)

  // Create sample invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNo: 'INV-1001',
      tenantId: tenant.id,
      customerId: customers[0].id,
      jobCardId: jobCards[0].id,
      subtotal: 7500,
      discount: 500,
      taxRate: 18,
      taxAmount: 1260,
      grandTotal: 8260,
      amountPaid: 8260,
      status: 'PAID',
    },
  })

  await prisma.invoiceItem.createMany({
    data: [
      {
        invoiceId: invoice1.id,
        description: 'iPhone 13 Pro LCD Screen Replacement',
        itemId: inventoryItems[0].id,
        quantity: 1,
        unitPrice: 6500,
        totalPrice: 6500,
      },
      {
        invoiceId: invoice1.id,
        description: 'Labor Charges',
        quantity: 1,
        unitPrice: 1000,
        totalPrice: 1000,
      },
    ],
  })

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNo: 'INV-1002',
      tenantId: tenant.id,
      customerId: customers[1].id,
      subtotal: 350,
      discount: 50,
      taxRate: 18,
      taxAmount: 54,
      grandTotal: 354,
      amountPaid: 354,
      status: 'PAID',
    },
  })

  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice2.id,
      description: 'Tempered Glass Screen Protector',
      itemId: inventoryItems[3].id,
      quantity: 2,
      unitPrice: 150,
      totalPrice: 300,
    },
  })

  console.log('✅ Created sample invoices with items')

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        tenantId: tenant.id,
        userId: owner.id,
        action: 'SYSTEM_SETUP',
        details: 'Initial system configuration completed',
      },
      {
        tenantId: tenant.id,
        userId: technician.id,
        action: 'CREATE_JOB_CARD',
        details: 'Created job card JOB-1001 for iPhone 13 Pro screen repair',
      },
      {
        tenantId: tenant.id,
        userId: cashier.id,
        action: 'CREATE_INVOICE',
        details: 'Generated invoice INV-1001 for ₹8,260',
      },
    ],
  })

  console.log('✅ Created audit logs')

  console.log('\n🎉 Seeding completed successfully!')
  console.log('\n📧 Login Credentials:')
  console.log('   Owner: owner@mobilepos.com / password123')
  console.log('   Manager: manager@mobilepos.com / password123')
  console.log('   Cashier: cashier@mobilepos.com / password123')
  console.log('   Technician: technician@mobilepos.com / password123')
  console.log('\n🌐 Tenant Slug: demo-shop')
  console.log('   Access at: http://localhost:3000/login')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
