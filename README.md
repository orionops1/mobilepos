# Mobile Repair Shop POS System

A modern, enterprise-grade cloud-based POS and billing system for Mobile Phone Repair Shops. Built with Next.js 15, React, TypeScript, Tailwind CSS, Prisma ORM, and PostgreSQL. Optimized for Vercel deployment.

## 🌟 Features

### Core Functionality
- **Professional Dashboard** - Real-time sales analytics, repair status tracking, revenue charts
- **Customer Management** - Complete CRM with history tracking and search
- **Mobile Repair Job Cards** - Device intake, status tracking, technician assignment
- **Advanced Billing System** - Multi-item invoices, GST/VAT support, inventory integration
- **Inventory Management** - Stock tracking, low stock alerts, supplier management
- **Comprehensive Reports** - Sales reports, technician performance, audit logs
- **Multi-tenant Architecture** - Support for multiple shops with isolated data
- **Role-based Access Control** - Owner, Manager, Cashier, Technician roles
- **Invoice Customization** - Branding, logos, business information
- **Print Support** - A4 and thermal printer (58mm/80mm) formats
- **WhatsApp Integration** - Send invoices and updates (ready for integration)
- **Audit Logging** - Complete activity tracking

### Technical Features
- **Modern UI/UX** - ShadCN UI components with dark mode support
- **Responsive Design** - Mobile-first, works on all devices
- **Server Actions** - Modern Next.js data fetching
- **Type Safety** - Full TypeScript implementation
- **Database Transactions** - Ensures data integrity
- **NextAuth** - Secure authentication
- **Vercel Optimized** - Fast edge deployment

## 📋 Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (or use Vercel Postgres/Supabase)
- npm/yarn/pnpm/bun package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/orionops1/mobilepos.git
cd mobilepos
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/mobilepos?schema=public"

# For Vercel Postgres, use:
# DATABASE_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com/verceldb?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="generate-a-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# App Configuration
APP_URL="http://localhost:3000"

# Encryption Key (32 characters for sensitive data)
ENCRYPTION_KEY="your-32-character-encryption-key"
```

### 4. Set Up the Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed the database with sample data
npx prisma db seed
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deploying to Vercel

**Before deploying, see [DEPLOYMENT.md](./DEPLOYMENT.md) for complete setup instructions.**

### Quick Deployment Checklist

- [ ] Set `NEXTAUTH_SECRET` in Vercel environment variables
- [ ] Set `DATABASE_URL` pointing to production PostgreSQL
- [ ] Set `NEXTAUTH_URL` to your Vercel deployment URL
- [ ] All environment variables from `.env.example` are configured
- [ ] Database migrations are applied

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" and import your repository
4. **Add environment variables** in Vercel dashboard:
   ```
   DATABASE_URL=your-postgresql-url
   NEXTAUTH_SECRET=generate-with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   NEXTAUTH_URL=https://your-app.vercel.app
   ```
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to your Vercel account
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Important Notes

1. **Database**: Your PostgreSQL must be accessible from Vercel
   - Use Vercel Postgres, Supabase, Neon, or Railway
   - Do NOT use localhost

2. **Environment Variables**: Set in Vercel → Project Settings → Environment Variables
   - Never commit `.env` files with secrets
   - Use `.env.example` as a template

3. **After Deployment**:
   - Test login with demo credentials
   - Check Vercel logs if issues occur
   - See troubleshooting in [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📁 Project Structure

```
mobilepos/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Seed data
├── public/                   # Static assets
├── src/
│   ├── app/
│   │   ├── actions/          # Server actions
│   │   │   ├── billing.ts
│   │   │   ├── customers.ts
│   │   │   ├── inventory.ts
│   │   │   ├── repairs.ts
│   │   │   └── reports.ts
│   │   ├── api/             # API routes
│   │   │   └── auth/        # NextAuth endpoints
│   │   ├── app/             # Protected app routes
│   │   │   └── [tenantSlug]/
│   │   │       ├── page.tsx          # Dashboard
│   │   │       ├── billing/          # Billing module
│   │   │       ├── customers/        # Customer module
│   │   │       ├── inventory/        # Inventory module
│   │   │       ├── repairs/          # Repair jobs module
│   │   │       ├── reports/          # Reports module
│   │   │       └── settings/         # Settings module
│   │   ├── login/           # Login page
│   │   ├── globals.css      # Global styles
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   └── providers/       # Context providers
│   ├── lib/
│   │   ├── auth.ts          # NextAuth configuration
│   │   ├── db.ts            # Prisma client
│   │   ├── utils.ts         # Utility functions
│   │   └── getTenantContext.ts  # Multi-tenant helper
│   └── types/               # TypeScript definitions
├── .env.example             # Environment template
├── next.config.ts           # Next.js configuration
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## 🔧 Configuration

### Database Schema

The application uses Prisma ORM with PostgreSQL. Key models:

- **Tenant** - Multi-tenant support
- **User** - Authentication and roles
- **Customer** - Customer information
- **JobCard** - Repair job tracking
- **Invoice** - Billing and payments
- **InvoiceItem** - Line items
- **InventoryItem** - Spare parts inventory
- **StockTransaction** - Stock movement history
- **AuditLog** - Activity logging

### User Roles

- **OWNER** - Full system access
- **MANAGER** - Most features except critical settings
- **CASHIER** - Billing and customer management
- **TECHNICIAN** - Repair job management only

### Default Login (After Seeding)

```
Email: owner@mobilepos.com
Password: password123
```

## 🎨 Customization

### Business Settings

Navigate to Settings page to customize:
- Shop name and logo
- Address and contact info
- GST/VAT tax number
- Default tax rate
- Currency
- QR code for payments

### Invoice Templates

Invoices automatically include:
- Business branding
- Customer information
- Device details (if linked to repair)
- Itemized charges
- Tax calculation
- Payment QR code

## 📱 WhatsApp Integration (Coming Soon)

The system is prepared for WhatsApp integration. To enable:

1. Set up WhatsApp Business API or use a service like Twilio
2. Add credentials to environment variables
3. Implement send functions in billing actions
4. Test with invoice sharing feature

## 🖨️ Printing

### A4 Invoices
- Standard business invoice format
- Print via browser print dialog
- PDF generation with jsPDF

### Thermal Printing
- Support for 58mm and 80mm thermal printers
- ESC/POS command generation
- USB and Bluetooth connectivity

## 🔒 Security

- Password hashing with bcrypt
- NextAuth session management
- Role-based access control
- SQL injection protection (Prisma)
- Environment variable encryption
- Audit logging for all actions

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npx prisma db pull

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Build Errors on Vercel

1. Ensure `DATABASE_URL` is set in Vercel environment variables
2. Check that Prisma client is generated: `npx prisma generate`
3. Review build logs for specific errors

### Authentication Issues

1. Verify `NEXTAUTH_SECRET` is set
2. Ensure `NEXTAUTH_URL` matches your domain
3. Check browser cookies are enabled

## 📊 Performance

- Optimized for Vercel Edge Network
- Static generation where possible
- Database query optimization
- Lazy loading of components
- Image optimization

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@mobilepos.com

## 🗺️ Roadmap

- [ ] WhatsApp Business API integration
- [ ] SMS notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support
- [ ] Export to accounting software
- [ ] Mobile app (React Native)
- [ ] Barcode scanner integration
- [ ] Customer loyalty program
- [ ] Automated backup system
- [ ] Multi-language support

## 📸 Screenshots

(Add screenshots of your application here)

---

Built with ❤️ using Next.js, React, TypeScript, and modern web technologies.
