# Deployment Guide - Mobile POS System

This guide will help you deploy the Mobile Repair Shop POS System to Vercel in production.

## 📋 Pre-Deployment Checklist

- [ ] PostgreSQL database ready (Vercel Postgres, Supabase, or external)
- [ ] GitHub/GitLab repository set up
- [ ] Vercel account created
- [ ] Environment variables prepared

## 🗄️ Database Setup Options

### Option 1: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the `DATABASE_URL` connection string
4. Note: Vercel Postgres includes connection pooling automatically

### Option 2: Supabase (Free Tier Available)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection String" (Transaction mode)
5. Use this as your `DATABASE_URL`

### Option 3: External PostgreSQL

Use any PostgreSQL provider:
- Railway
- Render
- AWS RDS
- DigitalOcean Managed Databases
- Self-hosted PostgreSQL

## 🚀 Deployment Steps

### Step 1: Push Code to Repository

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your Git provider (GitHub/GitLab/Bitbucket)
4. Choose your repository
5. Click "Import"

### Step 3: Configure Environment Variables

Add these environment variables in Vercel:

#### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require

# NextAuth (CRITICAL - Generate secure values)
NEXTAUTH_SECRET=<generate-random-secret-32-chars-or-more>
NEXTAUTH_URL=https://your-app-name.vercel.app

# App
APP_URL=https://your-app-name.vercel.app

# Encryption
ENCRYPTION_KEY=<generate-random-32-character-key>
```

#### Generate Secure Keys

Use these commands to generate secure keys:

```bash
# Generate NEXTAUTH_SECRET (Linux/Mac)
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -hex 16
```

Or use online tools:
- [Generate Random](https://generate-random.org/encryption-key-generator)
- [Random.org](https://www.random.org/strings/)

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Vercel will provide your production URL

### Step 5: Run Database Migrations

After first deployment:

```bash
# Pull environment variables locally
vercel env pull .env.production

# Run migrations
DATABASE_URL="your-production-db-url" npx prisma migrate deploy

# Seed initial data (optional)
DATABASE_URL="your-production-db-url" npx prisma db seed
```

Or use Vercel CLI:

```bash
vercel env pull
npx prisma migrate deploy
```

## 🔧 Post-Deployment Configuration

### 1. Create First Tenant & User

After deployment, you'll need to create the first tenant and user. You can:

**Option A: Run seed script** (if you want demo data):
```bash
DATABASE_URL="your-production-db-url" npx prisma db seed
```

**Option B: Manually create via Prisma Studio**:
```bash
DATABASE_URL="your-production-db-url" npx prisma studio
```

**Option C: Create via API** (if you build a signup page)

### 2. Access Your Application

1. Go to your production URL: `https://your-app-name.vercel.app`
2. Navigate to `/login`
3. Login with seeded credentials (if you ran seed):
   - Email: `owner@mobilepos.com`
   - Password: `password123`

### 3. Update Business Settings

1. Log in as Owner
2. Go to Settings
3. Update:
   - Shop Name
   - Logo (upload or provide URL)
   - Address
   - Contact Information
   - GST/VAT Number
   - Payment QR Code

## 🔒 Security Checklist

### Production Security

- [ ] Change all default passwords immediately
- [ ] Use strong, unique `NEXTAUTH_SECRET`
- [ ] Enable SSL/TLS on database (use `?sslmode=require` in connection string)
- [ ] Set up database backups
- [ ] Enable Vercel Authentication (optional extra layer)
- [ ] Configure CORS if needed
- [ ] Review and restrict API routes
- [ ] Enable rate limiting (consider Vercel Pro features)

### Environment Variables Security

- [ ] Never commit `.env` files to Git
- [ ] Use Vercel's environment variable encryption
- [ ] Separate development and production secrets
- [ ] Rotate keys periodically
- [ ] Use different database credentials for production

## 📊 Monitoring & Maintenance

### Monitor Application

1. **Vercel Analytics** (Built-in)
   - Go to your project → Analytics
   - Monitor traffic, performance, errors

2. **Vercel Logs**
   - Real-time logs in Vercel dashboard
   - Filter by function, time, status

3. **Database Monitoring**
   - Check connection pool usage
   - Monitor query performance
   - Set up alerts for slow queries

### Regular Maintenance Tasks

```bash
# Check database health
npx prisma db pull

# Review audit logs
# Access via Reports → Audit Logs in your app

# Backup database (if self-hosted)
pg_dump -U username -d dbname > backup.sql

# Update dependencies
npm update
npm audit fix
```

## 🐛 Troubleshooting

### Build Failures

**Error: "Prisma Client not generated"**
```bash
# Solution: Ensure postinstall script runs
# Check package.json has:
"postinstall": "prisma generate"
```

**Error: "Cannot connect to database"**
- Check `DATABASE_URL` is correctly set in Vercel
- Verify database accepts connections from Vercel IPs
- Ensure SSL mode is configured: `?sslmode=require`

**Error: "Module not found"**
```bash
# Clear cache and rebuild
vercel --force
```

### Runtime Errors

**Error: "NextAuth configuration error"**
- Verify `NEXTAUTH_URL` matches your production domain
- Check `NEXTAUTH_SECRET` is set

**Error: "Database timeout"**
- Use connection pooling
- For Vercel Postgres, this is automatic
- For external DB, add `?connection_limit=10&pool_timeout=30`

**Error: "Session expired immediately"**
- Check `NEXTAUTH_URL` includes `https://`
- Verify cookies are not blocked

## 🔄 Updates & Redeployment

### Deploy Updates

```bash
# Make changes
git add .
git commit -m "Update feature X"
git push origin main

# Vercel auto-deploys from main branch
```

### Manual Deployment

```bash
vercel --prod
```

### Rollback Deployment

1. Go to Vercel Dashboard
2. Select your project
3. Go to Deployments
4. Find previous working deployment
5. Click "..." → "Promote to Production"

## 📈 Scaling Considerations

### Performance Optimization

1. **Database Optimization**
   - Add indexes for frequently queried fields
   - Use database connection pooling
   - Consider read replicas for heavy traffic

2. **Caching**
   - Use Vercel's Edge Caching
   - Implement Redis for session storage (optional)
   - Cache static reports

3. **Code Optimization**
   - Implement pagination for large lists
   - Lazy load components
   - Optimize images

### Upgrade Path

**Basic → Growing Business**
- Upgrade Vercel plan for more resources
- Implement rate limiting
- Add monitoring/alerting

**Growing → Enterprise**
- Separate database per major tenant
- Implement queue system for background jobs
- Add CDN for static assets
- Multi-region deployment

## 🌐 Custom Domain Setup

### Add Custom Domain to Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `pos.yourbusiness.com`)
3. Configure DNS:

**For root domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For subdomain:**
```
Type: CNAME
Name: pos
Value: cname.vercel-dns.com
```

4. Wait for DNS propagation (5-60 minutes)
5. Update `NEXTAUTH_URL` and `APP_URL` to your custom domain

## 📞 Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🎉 Congratulations!

Your Mobile POS System is now live in production! 

Next steps:
1. ✅ Test all features thoroughly
2. ✅ Create your business users
3. ✅ Customize branding
4. ✅ Import existing customer data (if any)
5. ✅ Train staff on the system
6. ✅ Start processing transactions!

---

For issues or questions, please open an issue on GitHub or contact support.
