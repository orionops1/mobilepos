# 🧪 Testing Guide - Login & POS Functionality

## ✅ What Was Fixed

### 1. **Database Client Initialization**
- ✅ Simplified Prisma client from complex proxy pattern to standard singleton
- ✅ Added proper connection pooling
- ✅ Enabled query logging in development mode

### 2. **Authentication Flow**
- ✅ Added comprehensive console logging throughout auth process
- ✅ Fixed login redirect logic with proper session handling
- ✅ Added session verification before redirect
- ✅ Improved error handling with detailed messages

### 3. **Login Page**
- ✅ Added proper loading states
- ✅ Disabled form inputs during submission
- ✅ Added spinner animation
- ✅ Session polling after login
- ✅ Proper error display
- ✅ Better UX feedback

### 4. **Password Hashing**
- ✅ Verified seed file uses same hashing as auth (PBKDF2)
- ✅ Demo users created with correct password hashes
- ✅ Password verification working correctly

## 🚀 How to Test

### Step 1: Ensure Dependencies are Installed

```bash
npm install
```

### Step 2: Setup Database (if not done)

If you haven't set up your database yet, follow `DATABASE_SETUP.md`

Quick option - Use Supabase:
1. Go to [supabase.com](https://supabase.com)
2. Create project
3. Copy connection string
4. Update `.env`:
```env
DATABASE_URL="your-supabase-connection-string"
```

### Step 3: Run Migrations and Seed

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed demo data
npx prisma db seed
```

You should see:
```
✅ Created tenant: Demo Mobile Repair Shop
✅ Created users: Owner, Manager, Cashier, Technician
✅ Created sample customers: 3
✅ Created inventory items: 5
✅ Created job cards: 3
✅ Created sample invoices with items
✅ Created audit logs

🎉 Seeding completed successfully!

📧 Login Credentials:
   Owner: owner@mobilepos.com / password123
   Manager: manager@mobilepos.com / password123
   Cashier: cashier@mobilepos.com / password123
   Technician: technician@mobilepos.com / password123

🌐 Tenant Slug: demo-shop
```

### Step 4: Start Development Server

```bash
npm run dev
```

Server should start on: `http://localhost:3000`

### Step 5: Test Login Flow

1. **Open Browser:**
   ```
   http://localhost:3000/login
   ```

2. **Open Browser Console** (F12 or Cmd+Option+I)
   - You should see logs from the authentication process

3. **Try Login with Demo Credentials:**
   ```
   Email: owner@mobilepos.com
   Password: password123
   ```

4. **Watch Console Logs:**
   You should see:
   ```
   🔐 Login attempt for: owner@mobilepos.com
   🔐 Attempting login for: owner@mobilepos.com
   📝 SignIn result: {ok: true, error: null, ...}
   ✅ Login successful!
   📦 Session data: {user: {...}}
   ✓ Redirecting to: /app/demo-shop
   ```

5. **Verify Redirect:**
   - Should automatically redirect to: `http://localhost:3000/app/demo-shop`
   - You should see the dashboard

### Step 6: Test Different User Roles

Test login with different roles to ensure RBAC works:

#### Owner (Full Access)
```
Email: owner@mobilepos.com
Password: password123
```
- Should see all modules
- Dashboard, Customers, Repairs, Billing, Inventory, Reports, Settings

#### Manager (Most Features)
```
Email: manager@mobilepos.com
Password: password123
```
- Should see most modules
- Cannot modify critical settings

#### Cashier (Billing Focus)
```
Email: cashier@mobilepos.com
Password: password123
```
- Should see: Billing, Customers, View Repairs
- Limited inventory access

#### Technician (Repairs Only)
```
Email: technician@mobilepos.com
Password: password123
```
- Should see: Repairs/Job Cards
- Customized dashboard showing diagnostics

## 🔍 Debugging Authentication Issues

### Check Database Connection

```bash
# Test database connection
npx prisma db pull
```

Should output:
```
✔ Introspected X models
```

### View Database in GUI

```bash
# Open Prisma Studio
npx prisma studio
```

Opens at: `http://localhost:5555`

Verify:
- ✅ Tenant exists with slug "demo-shop"
- ✅ Users exist with emails ending in @mobilepos.com
- ✅ User passwords are hashed (format: `salt:hash`)

### Check Environment Variables

```bash
cat .env
```

Verify:
- ✅ `DATABASE_URL` is set correctly
- ✅ `NEXTAUTH_SECRET` is set (min 32 characters)
- ✅ `NEXTAUTH_URL` is "http://localhost:3000"

### Server Console Logs

When you run `npm run dev`, watch the terminal for logs:

**Successful login logs:**
```
🔐 Login attempt for: owner@mobilepos.com
✓ User found: owner@mobilepos.com - Role: OWNER
✓ Password verified for: owner@mobilepos.com
✓ Tenant: Demo Mobile Repair Shop (slug: demo-shop)
✓ JWT created for: owner@mobilepos.com
✓ Session created for: owner@mobilepos.com
```

**Failed login logs:**
```
🔐 Login attempt for: wrong@email.com
❌ User not found: wrong@email.com
```

## ⚠️ Common Issues & Solutions

### Issue 1: "Invalid email or password"

**Cause:** User not seeded or password hash mismatch

**Solution:**
```bash
# Re-run seed
npx prisma db seed

# Or check user exists
npx prisma studio
```

### Issue 2: Login succeeds but doesn't redirect

**Cause:** Session not being created properly

**Solution:**
1. Check browser console for errors
2. Verify `NEXTAUTH_URL` in `.env`
3. Clear browser cookies
4. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue 3: "Database connection error"

**Cause:** DATABASE_URL incorrect or database not accessible

**Solution:**
```bash
# Test connection
npx prisma db pull

# If fails, check:
# 1. DATABASE_URL in .env is correct
# 2. Database service is running
# 3. Firewall not blocking connection
```

### Issue 4: Page just refreshes, no error shown

**Cause:** NextAuth secret mismatch or session issue

**Solution:**
1. Regenerate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

2. Update in `.env`
3. Restart dev server

### Issue 5: "Prisma Client not generated"

**Solution:**
```bash
npx prisma generate
npm run dev
```

## ✅ Success Checklist

After testing, verify:

- [x] Login page loads at `/login`
- [x] Form shows email and password fields
- [x] Demo credentials hint is visible
- [x] Entering wrong credentials shows error message
- [x] Entering correct credentials shows loading spinner
- [x] Browser console shows authentication logs
- [x] Successful login redirects to dashboard
- [x] Dashboard loads at `/app/demo-shop`
- [x] User name appears in dashboard header
- [x] All modules are accessible in sidebar
- [x] Logout functionality works

## 🎯 Test Each Module

After successful login, test each module:

### Dashboard
- ✅ Shows sales metrics
- ✅ Revenue chart displays
- ✅ Recent transactions table shows invoices
- ✅ Top customers list populated

### Customers
- ✅ Shows 3 demo customers
- ✅ Can search customers
- ✅ Click customer to see details
- ✅ View customer history (repairs & invoices)

### Repairs
- ✅ Shows 3 demo job cards
- ✅ Can filter by status
- ✅ Can view job details
- ✅ Status badges show correctly

### Billing
- ✅ Shows 2 demo invoices
- ✅ Can filter by status
- ✅ Can view invoice details
- ✅ Invoice items display

### Inventory
- ✅ Shows 5 demo inventory items
- ✅ Stock quantities visible
- ✅ Can filter by category

### Reports
- ✅ Sales reports generate
- ✅ Date range filtering works
- ✅ Report data displays

### Settings
- ✅ Business info displays
- ✅ Can update shop name
- ✅ Tax settings visible

## 📊 Performance Check

Expected load times:
- Login page: < 1 second
- Authentication: < 2 seconds
- Dashboard load: < 3 seconds
- Module switching: < 1 second

If slower:
1. Check database connection latency
2. Verify network speed
3. Check browser console for errors

## 🎉 Everything Working?

If all tests pass:
1. ✅ Authentication system working
2. ✅ Database connected properly
3. ✅ All modules accessible
4. ✅ Data loading correctly
5. ✅ Ready for customization!

## 🚀 Next Steps

Once everything is working:

1. **Customize Settings**
   - Update business name
   - Add logo
   - Set tax rates

2. **Add Real Data**
   - Create real customers
   - Add actual inventory
   - Start processing repairs

3. **Deploy to Production**
   - Follow `DEPLOYMENT.md`
   - Use Vercel for hosting

## 🆘 Still Having Issues?

1. Check all files in terminal output
2. Review browser console errors
3. Check `npm run dev` terminal logs
4. Verify `.env` configuration
5. Try `npx prisma studio` to inspect database
6. Clear browser cache and cookies
7. Try a different browser

## 📞 Debug Commands

```bash
# Check Node version
node --version  # Should be 18+

# Check npm version
npm --version   # Should be 9+

# Test database
npx prisma db pull

# View database
npx prisma studio

# Check environment
cat .env

# View logs with more detail
npm run dev | tee debug.log
```

---

**Happy Testing! 🧪✨**

Once everything works, you'll have a fully functional Mobile POS system ready to use!
