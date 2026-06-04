# Vercel Setup - Quick Reference

## Your NEXTAUTH_SECRET (Generated)
```
b6e34eb2d6c983d2e8a80e79ced7572bca2139535c0d2434f70f4d414696c9cc
```

> ⚠️ Copy this value into Vercel. Never commit it to git.

---

## Step-by-Step Setup (2 minutes)

### 1. Go to Vercel Dashboard
https://vercel.com/dashboard

### 2. Click Your Project
Find and click: **mobilepos**

### 3. Go to Settings
Top navigation → **Settings**

### 4. Open Environment Variables
Left sidebar → **Environment Variables**

### 5. Add Each Variable

#### Variable 1: NEXTAUTH_SECRET
| Field | Value |
|-------|-------|
| Name | `NEXTAUTH_SECRET` |
| Value | `b6e34eb2d6c983d2e8a80e79ced7572bca2139535c0d2434f70f4d414696c9cc` |
| Environments | Production, Preview, Development |

Click **Add**

#### Variable 2: DATABASE_URL
| Field | Value |
|-------|-------|
| Name | `DATABASE_URL` |
| Value | `postgresql://user:password@host:port/dbname` |
| Environments | Production |

Click **Add**

> Replace with your actual PostgreSQL connection string

#### Variable 3: NEXTAUTH_URL
| Field | Value |
|-------|-------|
| Name | `NEXTAUTH_URL` |
| Value | `https://your-app-name.vercel.app` |
| Environments | Production |

Click **Add**

> Replace with your actual Vercel deployment URL

### 6. Redeploy
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **...** menu
4. Select **Redeploy**

Or push a new commit to trigger automatic redeploy.

---

## Verify It Works

1. Wait for deployment to complete (green checkmark)
2. Click "Visit" to open your app
3. Try logging in:
   - Shop: `orion`
   - Email: `admin@orion.com`
   - Password: `admin123`
4. If login works → ✅ Done!
5. If 500 error → Check Vercel runtime logs for errors

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Still getting 500 error | Verify all 3 env vars are set. Redeploy. Check Vercel logs. |
| Can't find Environment Variables | Settings → Environment Variables (not Build & Deploy) |
| DATABASE_URL still missing | Add it for "Production" environment specifically |
| Login not working after deploy | Clear browser cookies. Try incognito mode. |

---

## Next: Database Migrations

After deployment succeeds, apply database migrations:

```bash
vercel env pull .env.local
npx prisma migrate deploy
```

Or if using managed database (Vercel Postgres, Supabase):
- Migrations should run automatically
- Check Vercel Function logs if issues

---

## Files Created for Reference

- `DEPLOYMENT.md` - Complete deployment guide
- `.env.example` - Template for environment variables
- `src/lib/auth.ts` - Updated with env var validation
