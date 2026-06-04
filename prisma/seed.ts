import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

async function main() {
  console.log('Seeding database...')

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'orion' },
    update: {},
    create: {
      name: 'Orion Mobile Repair POS',
      slug: 'orion',
      address: '123 Tech Avenue, Bengaluru, India',
      phone: '+91 98765 43210',
      email: 'contact@orionpos.com',
      website: 'www.orionpos.com',
      taxNumber: '29AAAAA0000A1Z5', // Indian GST format
      currency: 'INR',
      taxRate: 18.00,
      qrCodeData: 'upi://pay?pa=orionpos@ybl&pn=Orion%20POS&am=0'
    }
  })

  console.log(`Tenant created: ${tenant.name} (${tenant.slug})`)

  // Create default users (Owner, Manager, Cashier, Technician)
  const passwordHash = hashPassword('admin123')

  const owner = await prisma.user.upsert({
    where: { email: 'admin@orion.com' },
    update: {},
    create: {
      name: 'Orion Owner',
      email: 'admin@orion.com',
      password: passwordHash,
      role: 'OWNER',
      tenantId: tenant.id
    }
  })
  console.log(`Owner user created: ${owner.name} (${owner.email})`)

  const manager = await prisma.user.upsert({
    where: { email: 'manager@orion.com' },
    update: {},
    create: {
      name: 'Orion Manager',
      email: 'manager@orion.com',
      password: passwordHash,
      role: 'MANAGER',
      tenantId: tenant.id
    }
  })
  console.log(`Manager user created: ${manager.name} (${manager.email})`)

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@orion.com' },
    update: {},
    create: {
      name: 'Orion Cashier',
      email: 'cashier@orion.com',
      password: passwordHash,
      role: 'CASHIER',
      tenantId: tenant.id
    }
  })
  console.log(`Cashier user created: ${cashier.name} (${cashier.email})`)

  const technician = await prisma.user.upsert({
    where: { email: 'tech@orion.com' },
    update: {},
    create: {
      name: 'Orion Tech',
      email: 'tech@orion.com',
      password: passwordHash,
      role: 'TECHNICIAN',
      tenantId: tenant.id
    }
  })
  console.log(`Technician user created: ${technician.name} (${technician.email})`)

  // Create default customer
  const customer = await prisma.customer.upsert({
    where: { tenantId_mobile: { tenantId: tenant.id, mobile: '9999999999' } },
    update: {},
    create: {
      name: 'Walk-In Customer',
      mobile: '9999999999',
      email: 'walkin@orionpos.com',
      address: 'Walk-in',
      tenantId: tenant.id
    }
  })
  console.log(`Default customer created: ${customer.name}`)

  // Create default inventory items
  const item1 = await prisma.inventoryItem.upsert({
    where: { tenantId_sku: { tenantId: tenant.id, sku: 'LCD-IPH13' } },
    update: {},
    create: {
      name: 'iPhone 13 Premium LCD Screen',
      sku: 'LCD-IPH13',
      category: 'LCD Screen',
      quantity: 12,
      minStockLevel: 3,
      purchaseCost: 3500.00,
      sellingPrice: 5500.00,
      supplierName: 'Apple Parts Supplier Ltd.',
      tenantId: tenant.id
    }
  })
  console.log(`Default inventory item created: ${item1.name}`)

  const item2 = await prisma.inventoryItem.upsert({
    where: { tenantId_sku: { tenantId: tenant.id, sku: 'BAT-IPH12' } },
    update: {},
    create: {
      name: 'iPhone 12 High Capacity Battery',
      sku: 'BAT-IPH12',
      category: 'Battery',
      quantity: 8,
      minStockLevel: 2,
      purchaseCost: 1200.00,
      sellingPrice: 2200.00,
      supplierName: 'Core Battery Labs',
      tenantId: tenant.id
    }
  })
  console.log(`Default inventory item created: ${item2.name}`)

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
