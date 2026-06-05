# QA Quick Start Guide

## 🎯 Primary Change: UPI QR Code Removal

**What changed:** The UPI QR code input field has been removed from the Settings tab.

**What to test:** Verify the field is gone and everything else still works.

---

## ⚡ Quick Test (10 Minutes)

### 1. Settings Page Test
```
1. Login as OWNER or MANAGER
2. Navigate to Settings tab
3. ✓ Verify UPI QR code field is NOT visible
4. ✓ Verify all other fields are present:
   - Shop Name ✓
   - Address ✓
   - Phone ✓
   - Email ✓
   - Website ✓
   - Tax Number ✓
   - Currency Dropdown ✓
   - Tax Rate ✓
   - Logo URL ✓
5. Fill in test data and save
6. ✓ Verify success message appears
7. Refresh page
8. ✓ Verify data persists
```

### 2. Invoice Creation Test
```
1. Go to Billing tab
2. Click "Add Invoice"
3. Select a customer
4. Add an item
5. Set amount paid
6. Save invoice
7. ✓ Verify invoice is created
8. ✓ Verify no errors in console
```

### 3. Invoice Print Test
```
1. Select an invoice
2. Click Print button
3. Select A4 format
4. Click Print
5. ✓ Verify print preview loads
6. ✓ Verify invoice details are correct
7. Close preview
8. Test with 80mm format
9. ✓ Verify compact layout works
```

**If all 3 tests pass:** ✅ System is working correctly!

---

## 🔍 Critical Areas to Check

### Before Testing:
- [ ] Clear browser cache
- [ ] Login with fresh session
- [ ] Use Chrome/Firefox latest version

### Files Changed:
- `src/app/app/[tenantSlug]/settings/SettingsClient.tsx`

### Files NOT Changed (But May Reference qrCodeData):
- `src/app/actions/billing.ts` - Still accepts optional qrCodeData
- `prisma/schema.prisma` - Database field still exists
- `src/app/app/[tenantSlug]/billing/BillingClient.tsx` - Print templates may reference it

### What Should Work:
✅ Settings page loads  
✅ Settings save without UPI field  
✅ Invoices create normally  
✅ Invoices print normally  
✅ All other features unchanged  

### What Should NOT Work:
❌ Adding UPI QR code via Settings UI (field removed)

---

## 🐛 Common Issues to Watch For

### Issue 1: TypeScript Errors
**Symptom:** Red squiggly lines in code editor  
**Check:** Open SettingsClient.tsx and look for errors  
**Expected:** No errors

### Issue 2: Runtime Errors
**Symptom:** Console shows errors when loading Settings  
**Check:** Open browser console (F12)  
**Expected:** No errors related to qrCodeData

### Issue 3: Form Submission Fails
**Symptom:** Settings don't save  
**Check:** Network tab in browser dev tools  
**Expected:** 200 OK response

### Issue 4: Print Layout Broken
**Symptom:** Invoice print preview looks wrong  
**Check:** Print modal and layout  
**Expected:** Normal layout (may still show QR placeholder if DB has data)

---

## 📊 Test Data

### Test Tenant Settings:
```
Shop Name: Test Mobile Shop
Address: 123 Test Street, Test City
Phone: +94-11-1234567
Email: test@shop.com
Website: https://testshop.com
Tax Number: VAT999999
Currency: LKR
Tax Rate: 15
Logo URL: https://example.com/logo.png
```

### Test Customer:
```
Name: John Doe
Mobile: 0771234567
Email: john@example.com
```

### Test Inventory Item:
```
Name: iPhone Screen
Category: LCD Screen
Quantity: 10
Selling Price: 5000
```

---

## 🚨 What to Report

### If You Find a Bug:

**Bug Report Template:**
```
Title: [Brief description]
Severity: Critical / High / Medium / Low
Steps to Reproduce:
1. 
2. 
3. 
Expected Result:
Actual Result:
Browser: 
User Role: 
Screenshot: [if applicable]
```

### Example Bug Report:
```
Title: Settings page fails to load
Severity: Critical
Steps to Reproduce:
1. Login as OWNER
2. Navigate to Settings tab
3. Page shows error
Expected Result: Settings form should load
Actual Result: White screen with error
Browser: Chrome 125
User Role: OWNER
Screenshot: [attached]
```

---

## ✅ Sign-off Checklist

After completing tests, check all that apply:

- [ ] Settings page loads without errors
- [ ] UPI QR code field is not visible
- [ ] Can save settings successfully
- [ ] Can create new invoices
- [ ] Can print invoices (A4 format)
- [ ] Can print invoices (80mm format)
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested as OWNER role
- [ ] Tested as MANAGER role

**Tester Name:** _________________  
**Date:** _________________  
**Status:** Pass / Fail / Conditional Pass  

**Notes:**
_________________________________________________
_________________________________________________
_________________________________________________

---

## 📞 Need Help?

**Found a critical bug?**
- Stop testing
- Document the issue
- Report immediately

**Not sure if something is a bug?**
- Take a screenshot
- Note the steps
- Ask for clarification

**Need access or test data?**
- Request developer assistance
- Use seed data if available

---

## 🎓 Testing Tips

1. **Clear cache between tests** - Prevents stale data issues
2. **Test in incognito mode** - Ensures clean session
3. **Check console frequently** - Catches hidden errors
4. **Take screenshots** - Easier to report issues
5. **Document everything** - Even if it seems minor
6. **Test edge cases** - Empty fields, max values, etc.
7. **Use multiple browsers** - Chrome and Firefox minimum
8. **Test different roles** - OWNER, MANAGER, CASHIER, TECHNICIAN

---

## 📚 Full Documentation

For comprehensive testing, see:
- `QA_CHECKLIST.md` - Complete 16-section checklist
- `CHANGE_SUMMARY.md` - Technical details and context
- `README.md` - Project overview and setup

---

**Document Version:** 1.0  
**Last Updated:** June 5, 2026  
**Quick Test Time:** ~10 minutes  
**Full Test Time:** ~2-4 hours
