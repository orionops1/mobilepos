# 🚀 Quick Start Guide

Get your Mobile POS System running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git installed

## Installation Steps

### 1. Install Node.js (if not installed)

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS:**
```bash
brew install node
```

**Windows:**
Download from [nodejs.org](https://nodejs.org)

### 2. Clone & Setup

```bash
# Clone the repository
git clone https://github.com/orionops1/mobilepos.git
cd mobilepos

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 3. Configure Database

Edit `.env` file:

**Option A: Local PostgreSQL**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mobilepos?schema=public"
```

**Option B: Supabase (Free)**
1. Go to [supabase.com](https://supabase.com) and create project
2. Get connection string from Settings → Database
3. Use it in `.env`:
```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Option C: Vercel Postgres**
```env
DATABASE_URL="postgres://default:[password]@[host].postgres.vercel-storage.com/verceldb?sslmode=require"
```

### 4. Set Secrets

Generate secure keys:

```bash
# Linux/Mac
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env
echo "ENCRYPTION_KEY=$(openssl rand -hex 16)" >> .env
```

Or manually add to `.env`:
```env
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters"
ENCRYPTION_KEY="your-32-character-encryption-key"
NEXTAUTH_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
```

### 5. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed demo data
npx prisma db seed
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Login

Navigate to [http://localhost:3000/login](http://localhost:3000/login)

**Demo Credentials:**
- Email: `owner@mobilepos.com`
- Password: `password123`
- Tenant: `demo-shop`

## 🎯 First Steps After Login

1. **Dashboard** - View overview and stats
2. **Settings** - Update business information and branding
3. **Customers** - Add your first customer
4. **Inventory** - Add spare parts
5. **Repairs** - Create a job card
6. **Billing** - Generate your first invoice

## 📱 Module Overview

| Module | Purpose | Access |
|--------|---------|--------|
| **Dashboard** | Overview, stats, charts | All roles |
| **Customers** | Customer management | All except Technician |
| **Repairs** | Job card tracking | All roles |
| **Billing** | Invoice generation | All except Technician |
| **Inventory** | Stock management | Owner, Manager |
| **Reports** | Analytics & reports | Owner, Manager |
| **Settings** | System configuration | Owner, Manager |

## 🔑 User Roles

| Role | Permissions |
|------|------------|
| **Owner** | Full access to everything |
| **Manager** | All features except critical settings |
| **Cashier** | Billing, customers, view repairs |
| **Technician** | Repair jobs only |

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create new migration
npx prisma db push       # Push schema changes
npx prisma db seed       # Seed database

# Prisma Commands
npx prisma generate      # Generate Prisma Client
npx prisma validate      # Validate schema
npx prisma format        # Format schema file

# Git
git status              # Check changes
git add .               # Stage all changes
git commit -m "message" # Commit changes
git push                # Push to remote
```

## 🐛 Troubleshooting

### Can't connect to database
```bash
# Test connection
npx prisma db pull

# Common fixes:
# 1. Check DATABASE_URL in .env
# 2. Ensure PostgreSQL is running
# 3. Verify credentials
# 4. Check firewall/network access
```

### Port 3000 already in use
```bash
# Use different port
PORT=3001 npm run dev

# Or kill process using port 3000
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module not found errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### Prisma Client errors
```bash
# Regenerate client
npx prisma generate

# Reset database (WARNING: deletes data)
npx prisma migrate reset
```

## 📚 Learn More

- [Full README](./README.md) - Complete documentation
- [Deployment Guide](./DEPLOYMENT.md) - Deploy to Vercel
- [Prisma Schema](./prisma/schema.prisma) - Database structure

## 🆘 Need Help?

- Check [README.md](./README.md) for detailed docs
- Review [GitHub Issues](https://github.com/orionops1/mobilepos/issues)
- Contact: support@mobilepos.com

## 🎉 You're Ready!

Your POS system is now running. Start by:

1. Updating business settings
2. Adding real customers
3. Creating repair jobs
4. Generating invoices

Happy repairing! 🔧📱
