# Deployment Guide

## Environment Variables Required

Before deploying to Vercel, ensure all required environment variables are set:

### Production (Vercel)

1. **Navigate to Vercel Dashboard**
   - Go to your project: https://vercel.com/dashboard
   - Click your project (mobilepos)
   - Go to **Settings → Environment Variables**

2. **Add the following variables:**

   | Variable | Value | Example |
   |----------|-------|---------|
   | `NEXTAUTH_SECRET` | Cryptographic secret for JWT signing | See "Generate Secret" below |
   | `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
   | `NEXTAUTH_URL` | Base URL of your app | `https://your-domain.vercel.app` |

3. **Generate NEXTAUTH_SECRET locally:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Or using OpenSSL:
   ```bash
   openssl rand -base64 32
   ```

4. **Set DATABASE_URL:**
   - For PostgreSQL: `postgresql://username:password@host:port/database`
   - Ensure your database is accessible from Vercel (not localhost)
   - Consider using a managed database service (Railway, Supabase, Neon)

5. **Set NEXTAUTH_URL:**
   - Development: `http://localhost:3000`
   - Production: `https://your-app-name.vercel.app`

6. **Redeploy after setting variables:**
   - Push a new commit, or
   - Manually trigger redeploy from Vercel dashboard

### Local Development (.env)

Create a `.env.local` file in the project root:

```
DATABASE_URL=postgresql://localhost/mobilepos_dev
NEXTAUTH_SECRET=your-local-dev-secret-can-be-anything-123
NEXTAUTH_URL=http://localhost:3000
```

**Never commit `.env` or `.env.local` files** — they contain secrets.

## Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Database is production-ready (not localhost)
- [ ] NEXTAUTH_SECRET is a strong random value
- [ ] NEXTAUTH_URL matches your actual deployment domain
- [ ] Run `npm run build` locally to verify no build errors
- [ ] Test login flow on deployed site
- [ ] Check Vercel logs for any errors: Dashboard → Deployments → Logs

## Troubleshooting

### 500 Error on /api/auth routes
- Check that `NEXTAUTH_SECRET` is set in Vercel environment variables
- Verify it's not undefined or empty
- Look for `NO_SECRET` error in Vercel Runtime Logs

### Database Connection Errors
- Ensure `DATABASE_URL` is set and valid
- Verify database is accessible from Vercel (may need to whitelist Vercel IPs)
- Check Prisma migrations are applied: `npx prisma migrate deploy`

### Session Not Working
- Ensure `NEXTAUTH_URL` matches your deployment URL
- Check browser cookies are being set (inspect DevTools → Application → Cookies)
- Verify JWT secret hasn't changed between deployments

## First Deploy Steps

1. Ensure all code is committed
2. Set environment variables in Vercel (see above)
3. Push to main branch or manually trigger deploy
4. Monitor Vercel logs during deployment
5. Test the app: try logging in with demo credentials
6. Check Vercel Runtime Logs if anything fails

## Demo Credentials

For testing:
- **Shop Slug:** `orion`
- **Email:** `admin@orion.com`
- **Password:** `admin123`
