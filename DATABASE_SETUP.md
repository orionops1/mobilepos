# 🗄️ Database Setup Guide

Your app needs a PostgreSQL database. Here are your options:

## ✅ Option 1: Supabase (Recommended - Free & Easy)

**Why Supabase?**
- ✅ Free tier available (500MB database)
- ✅ No credit card required
- ✅ Takes 2 minutes to setup
- ✅ No installation needed
- ✅ Automatic backups
- ✅ Web interface included

**Setup Steps:**

1. **Go to [https://supabase.com](https://supabase.com)**

2. **Sign Up** (use GitHub, Google, or email)

3. **Create New Project:**
   - Click "New Project"
   - Name: `mobilepos` (or any name)
   - Database Password: Create a strong password (SAVE THIS!)
   - Region: Choose closest to you
   - Click "Create new project"
   - Wait ~2 minutes for provisioning

4. **Get Connection String:**
   - Click on your project
   - Go to **Settings** (⚙️ icon on left sidebar)
   - Click **Database**
   - Scroll to **Connection String** section
   - Select **URI** tab (not Session or Transaction)
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your actual password

5. **Update `.env` file:**
   ```bash
   nano .env
   ```
   
   Replace the DATABASE_URL line with your Supabase connection string:
   ```env
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
   ```
   
   Example:
   ```env
   DATABASE_URL="postgresql://postgres.abcdefgh:MyPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

6. **Save and continue with setup:**
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed
   npm run dev
   ```

---

## Option 2: Vercel Postgres (Easy but requires Vercel account)

**Setup Steps:**

1. **Go to [https://vercel.com](https://vercel.com)**

2. **Sign Up** (free, use GitHub)

3. **Create Database:**
   - Go to Storage tab
   - Click "Create Database"
   - Select "Postgres"
   - Name: `mobilepos`
   - Region: Choose closest
   - Click "Create"

4. **Get Connection String:**
   - Click on your database
   - Go to **Connect** tab
   - Copy the connection string under "Prisma" section
   - It looks like: `postgres://default:xxx@xxx.postgres.vercel-storage.com/verceldb?sslmode=require`

5. **Update `.env` file:**
   ```bash
   nano .env
   ```
   
   Replace DATABASE_URL:
   ```env
   DATABASE_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com/verceldb?sslmode=require"
   ```

6. **Continue setup:**
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed
   npm run dev
   ```

---

## Option 3: Local PostgreSQL Installation

**For Ubuntu/Debian:**

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
```

**In PostgreSQL prompt:**
```sql
CREATE DATABASE mobilepos;
CREATE USER mobileuser WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE mobilepos TO mobileuser;
\q
```

**Update `.env` file:**
```bash
nano .env
```

```env
DATABASE_URL="postgresql://mobileuser:yourpassword@localhost:5432/mobilepos?schema=public"
```

**Continue setup:**
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

---

## ⚠️ Common Issues

### Error: "Can't reach database server"
- Check your connection string is correct
- Check your password has no special characters that need escaping
- For Supabase: Make sure you're using the URI format, not Session mode
- Check your firewall isn't blocking the connection

### Error: "Authentication failed"
- Double-check your password
- Make sure you replaced `[YOUR-PASSWORD]` with actual password
- Try resetting database password in Supabase/Vercel settings

### Error: "Database does not exist"
- For local PostgreSQL: Run the CREATE DATABASE command
- For Supabase/Vercel: The database is created automatically

### Error: "SSL connection required"
- Add `?sslmode=require` to the end of your connection string
- Or for Supabase add `?sslmode=require` if not already there

---

## ✅ Verify Connection

Test your database connection:

```bash
npx prisma db pull
```

If successful, you should see:
```
✔ Introspected 0 models and wrote them into prisma/schema.prisma
```

---

## 🎯 Quick Start After Database Setup

Once your `.env` has the correct DATABASE_URL:

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed demo data
npx prisma db seed

# Start the app
npm run dev
```

Open http://localhost:3000 and login:
- Email: `owner@mobilepos.com`
- Password: `password123`

---

## 💡 Recommendation

**Use Supabase** for the easiest setup:
1. Free forever (up to 500MB)
2. No credit card required
3. 2-minute setup
4. Web interface to view data
5. Automatic backups
6. Production-ready

---

## 🆘 Still Having Issues?

1. Make sure Node.js is installed: `node --version`
2. Make sure you're in the project directory: `pwd`
3. Check your `.env` file has no extra spaces or quotes
4. Make sure DATABASE_URL is on one line
5. Try restarting your terminal

**Example of correct `.env` format:**
```env
DATABASE_URL="postgresql://postgres.abcdefgh:MyPass123@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
NEXTAUTH_SECRET="dev-secret-key-change-in-production-2024"
NEXTAUTH_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
ENCRYPTION_KEY="dev-encryption-key-32-chars!!"
```

No extra lines between variables, no spaces around `=` signs.

---

**Ready? Let's go! 🚀**
