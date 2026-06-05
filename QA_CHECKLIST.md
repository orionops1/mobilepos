# Mobile POS System - Full QA Checklist

## Change Summary
✅ **Removed UPI QR Code settings from Settings tab**
- Removed UPI QR code input field from SettingsClient.tsx
- Removed qrCodeData state variable
- Removed QrCode icon import
- Backend still supports qrCodeData for backward compatibility

---

## 1. Authentication & Authorization QA

### 1.1 User Registration
- [ ] Navigate to `/signup`
- [ ] Register a new user with valid credentials
- [ ] Verify tenant slug is created automatically
- [ ] Verify default OWNER role is assigned
- [ ] Check that user is redirected after successful registration

### 1.2 User Login
- [ ] Navigate to `/login`
- [ ] Login with valid credentials
- [ ] Verify successful redirect to tenant dashboard
- [ ] Login with invalid credentials
- [ ] Verify error message is displayed
- [ ] Check session persistence

### 1.3 Role-Based Access Control
- [ ] Test OWNER role - full access to all features
- [ ] Test MANAGER role - access to settings and operations
- [ ] Test CASHIER role - access to billing and customers
- [ ] Test TECHNICIAN role - limited access (no pricing, no settings)

---

## 2. Settings Module QA

### 2.1 Settings Page Access
- [ ] Navigate to `/app/[tenantSlug]/settings`
- [ ] Verify only OWNER and MANAGER roles can access
- [ ] TECHNICIAN/CASHIER should be blocked

### 2.2 Business Settings Form
- [ ] **Shop Name** - Required field validation
- [ ] **Address** - Text area input works
- [ ] **Phone** - Phone number input
- [ ] **Email** - Email validation
- [ ] **Website** - URL input
- [ ] **Tax Number** - GST/VAT input
- [ ] **Currency** - Dropdown selection (LKR, INR, USD, EUR, GBP)
- [ ] **Tax Rate** - Percentage input with decimal support
- [ ] **Logo URL** - URL input for shop logo
- [ ] ✅ **UPI QR Code field is REMOVED** - Verify field is not visible

### 2.3 Settings Save Functionality
- [ ] Fill all fields with valid data
- [ ] Click "Save Configuration"
- [ ] Verify success message appears
- [ ] Verify changes persist after page refresh
- [ ] Test with empty optional fields
- [ ] Test with invalid data in fields
- [ ] Verify error handling

---

## 3. Customers Module QA

### 3.1 Customer List & Search
- [ ] Navigate to `/app/[tenantSlug]/customers`
- [ ] Verify customer list loads
- [ ] Search by customer name
- [ ] Search by mobile number
- [ ] Verify search results are accurate
- [ ] Test clear filters functionality

### 3.2 Add New Customer
- [ ] Click "Add Customer" button
- [ ] Fill required fields (Name, Mobile)
- [ ] Fill optional fields (Email, Address, Alt Mobile, Notes)
- [ ] Submit form
- [ ] Verify customer appears in list
- [ ] Test duplicate mobile number validation

### 3.3 Edit Customer
- [ ] Select a customer from list
- [ ] Click edit button
- [ ] Modify customer details
- [ ] Save changes
- [ ] Verify updates appear immediately

### 3.4 Delete Customer
- [ ] Select a customer
- [ ] Click delete button
- [ ] Confirm deletion
- [ ] Verify customer is removed from list
- [ ] Verify associated records are handled properly

### 3.5 Customer History
- [ ] Select a customer
- [ ] View repair history (job cards)
- [ ] View invoice history
- [ ] Verify all historical data loads correctly

---

## 4. Inventory Module QA

### 4.1 Inventory List & Filters
- [ ] Navigate to `/app/[tenantSlug]/inventory`
- [ ] View all inventory items
- [ ] Filter by category
- [ ] Filter by "Low Stock Alerts"
- [ ] Search by item name, SKU, or supplier
- [ ] Verify low stock badge appears correctly

### 4.2 Add Inventory Item
- [ ] Click "Add Stock Item" (not visible for TECHNICIAN)
- [ ] Fill all required fields:
  - [ ] Part Name
  - [ ] Category
  - [ ] Initial Quantity
  - [ ] Min Stock Level
  - [ ] Purchase Cost
  - [ ] Selling Price
- [ ] Fill optional fields (SKU, Supplier info)
- [ ] Submit form
- [ ] Verify item appears in list

### 4.3 Edit Inventory Item
- [ ] Select an item
- [ ] Click edit button
- [ ] Modify details (name, prices, supplier)
- [ ] Save changes
- [ ] Verify updates are reflected

### 4.4 Stock Adjustment (Restock)
- [ ] Select an item
- [ ] Click "Restock" button
- [ ] Choose "Stock In" (+)
- [ ] Enter quantity and note
- [ ] Submit
- [ ] Verify stock count increases
- [ ] Choose "Stock Out" (-)
- [ ] Verify stock count decreases
- [ ] Check stock transaction log

### 4.5 TECHNICIAN Role Restrictions
- [ ] Login as TECHNICIAN
- [ ] Verify "Add Stock Item" button is hidden
- [ ] Verify pricing columns are hidden
- [ ] Verify supplier columns are hidden
- [ ] Verify edit/restock buttons are hidden

---

## 5. Billing/Invoice Module QA

### 5.1 Invoice List & Filters
- [ ] Navigate to `/app/[tenantSlug]/billing`
- [ ] View all invoices
- [ ] Filter by status (PAID, PARTIAL, UNPAID, CANCELLED)
- [ ] Filter by date range (start and end date)
- [ ] Search by invoice number or customer name
- [ ] Test "Apply Filters" button
- [ ] Test "Clear All" filters button

### 5.2 Create New Invoice
- [ ] Click "Add" button
- [ ] Select customer from dropdown
- [ ] **Test without job card link:**
  - [ ] Add item lines manually
  - [ ] Test inventory item linking
  - [ ] Verify selling price auto-fills
  - [ ] Verify stock availability check
- [ ] **Test with job card link:**
  - [ ] Select a ready job card
  - [ ] Verify customer auto-fills
  - [ ] Verify repair charges appear
- [ ] Add multiple item lines
- [ ] Remove item lines
- [ ] Set discount amount
- [ ] Verify tax calculation (based on tenant tax rate)
- [ ] Set amount paid
- [ ] Select payment status
- [ ] Submit invoice
- [ ] Verify invoice appears in list

### 5.3 Quick Add Customer from Invoice
- [ ] In invoice creation modal
- [ ] Click "Quick Add Customer"
- [ ] Fill customer details
- [ ] Submit
- [ ] Verify customer is created
- [ ] Verify customer is auto-selected in invoice

### 5.4 Edit Invoice
- [ ] Select an existing invoice
- [ ] Click edit button
- [ ] Modify items (add, remove, change quantities)
- [ ] Change discount
- [ ] Change payment amount
- [ ] Change status
- [ ] Submit changes
- [ ] Verify stock is adjusted correctly (reverted then re-applied)
- [ ] Verify edit log is created

### 5.5 Cancel Invoice
- [ ] Select an invoice
- [ ] Click cancel button
- [ ] Confirm cancellation
- [ ] Verify status changes to CANCELLED
- [ ] Verify stock is restored
- [ ] Verify invoice cannot be edited after cancellation

### 5.6 Invoice Calculations
- [ ] Verify subtotal calculation (sum of all items)
- [ ] Verify discount subtraction
- [ ] Verify net amount calculation
- [ ] Verify tax calculation (net × tax rate %)
- [ ] Verify grand total calculation
- [ ] Verify balance due calculation (grand total - amount paid)

### 5.7 Stock Deduction on Invoice
- [ ] Create invoice with inventory items
- [ ] Verify stock quantity decreases
- [ ] Verify stock transaction log is created
- [ ] Test insufficient stock scenario
- [ ] Verify error message appears

### 5.8 Print Invoice
- [ ] Select an invoice
- [ ] Click print button
- [ ] **Test A4 format:**
  - [ ] Verify shop details appear
  - [ ] Verify customer details appear
  - [ ] Verify invoice items table
  - [ ] Verify calculations (subtotal, discount, tax, total)
  - [ ] Verify terms and conditions
  - [ ] ✅ **Verify UPI QR code placeholder (if qrCodeData exists in DB)**
  - [ ] Trigger print dialog
- [ ] **Test 80mm thermal format:**
  - [ ] Verify compact layout
  - [ ] Verify all details are present
  - [ ] Trigger print dialog
- [ ] **Test 58mm thermal format:**
  - [ ] Verify very compact layout
  - [ ] Trigger print dialog

### 5.9 WhatsApp Integration
- [ ] Select an invoice
- [ ] Click WhatsApp button
- [ ] **Test "Summary" option:**
  - [ ] Verify message contains invoice details
  - [ ] Verify WhatsApp URL is correct
  - [ ] Test opening WhatsApp
- [ ] **Test "Status Update" option:**
  - [ ] Verify job status message
  - [ ] Test opening WhatsApp
- [ ] **Test "PDF Link" option:**
  - [ ] Verify link is included
  - [ ] Test opening WhatsApp

---

## 6. Repairs/Job Cards Module QA

### 6.1 Job Card List & Filters
- [ ] Navigate to `/app/[tenantSlug]/repairs`
- [ ] View all job cards
- [ ] Filter by status (RECEIVED, DIAGNOSING, WAITING_PARTS, REPAIRING, READY, DELIVERED)
- [ ] Search by job number, customer name, device details
- [ ] Verify status badges appear correctly

### 6.2 Create Job Card
- [ ] Click "Add" button
- [ ] Select customer
- [ ] Fill device details (brand, model, IMEI, color, storage)
- [ ] Describe issue
- [ ] Document physical condition
- [ ] List accessories received
- [ ] Set estimated cost
- [ ] Set advance payment
- [ ] Set expected delivery date
- [ ] Add technician notes
- [ ] Assign technician
- [ ] Submit
- [ ] Verify job card appears with unique job number

### 6.3 Edit Job Card
- [ ] Select a job card
- [ ] Click edit button
- [ ] Modify details
- [ ] Change status
- [ ] Save changes
- [ ] Verify updates are reflected

### 6.4 Job Card Status Workflow
- [ ] Create job card (RECEIVED status)
- [ ] Update to DIAGNOSING
- [ ] Update to WAITING_PARTS
- [ ] Update to REPAIRING
- [ ] Update to READY
- [ ] Generate invoice from job card
- [ ] Verify status changes to DELIVERED when invoice is PAID

### 6.5 Link Job Card to Invoice
- [ ] Navigate to a READY job card
- [ ] Click "Generate Invoice" or similar action
- [ ] Verify invoice pre-fills with job details
- [ ] Verify repair charges = estimated cost - advance payment
- [ ] Complete and submit invoice
- [ ] Verify job card status updates

---

## 7. Reports Module QA

### 7.1 Dashboard Metrics
- [ ] Navigate to `/app/[tenantSlug]/reports`
- [ ] Verify total revenue calculation
- [ ] Verify total invoices count
- [ ] Verify pending jobs count
- [ ] Verify low stock alerts count

### 7.2 Date Range Filters
- [ ] Set custom date range
- [ ] Apply filters
- [ ] Verify metrics update
- [ ] Test predefined ranges (Today, This Week, This Month)

### 7.3 Charts and Visualizations
- [ ] Verify revenue chart displays correctly
- [ ] Verify sales by category chart
- [ ] Verify payment status breakdown
- [ ] Verify job status breakdown

### 7.4 Top Items Report
- [ ] Verify top-selling items list
- [ ] Verify top customers list
- [ ] Verify data accuracy

---

## 8. Multi-Tenancy QA

### 8.1 Tenant Isolation
- [ ] Create two separate tenant accounts
- [ ] Add data to Tenant A
- [ ] Login as Tenant B
- [ ] Verify Tenant B cannot see Tenant A's data
- [ ] Verify URL slug routing works correctly

### 8.2 Tenant Settings Independence
- [ ] Update settings for Tenant A
- [ ] Login as Tenant B
- [ ] Verify Tenant B's settings are unchanged
- [ ] Verify currency, tax rates are independent

---

## 9. Database & Data Integrity QA

### 9.1 Transaction Consistency
- [ ] Create invoice with inventory items
- [ ] Verify stock deduction happens atomically
- [ ] Test invoice creation failure scenario
- [ ] Verify stock is NOT deducted on failure

### 9.2 Cascade Deletes
- [ ] Delete a customer
- [ ] Verify related data handling (invoices, job cards)
- [ ] Delete a tenant (if admin panel exists)
- [ ] Verify all related data is cleaned up

### 9.3 Audit Logs
- [ ] Perform various operations
- [ ] Check audit log creation
- [ ] Verify user, action, and timestamp are recorded

---

## 10. UI/UX QA

### 10.1 Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px)
- [ ] Verify all modals are responsive
- [ ] Verify tables are scrollable on small screens

### 10.2 Loading States
- [ ] Verify loading spinners appear during operations
- [ ] Verify button disabled states during form submission
- [ ] Verify "isPending" states work correctly

### 10.3 Error Handling
- [ ] Test form validation errors
- [ ] Test network errors
- [ ] Test server errors
- [ ] Verify error messages are user-friendly
- [ ] Verify error messages are cleared appropriately

### 10.4 Success Feedback
- [ ] Verify success messages appear
- [ ] Verify auto-dismiss of success banners
- [ ] Verify visual confirmation (badges, colors)

### 10.5 Accessibility
- [ ] Test keyboard navigation
- [ ] Test form labels and ARIA attributes
- [ ] Test color contrast
- [ ] Test with screen reader (basic check)

---

## 11. Performance QA

### 11.1 Page Load Times
- [ ] Measure dashboard load time
- [ ] Measure large data list load time (100+ records)
- [ ] Verify lazy loading if implemented

### 11.2 Database Queries
- [ ] Check for N+1 query problems
- [ ] Verify proper use of `include` in Prisma queries
- [ ] Test with large datasets

---

## 12. Security QA

### 12.1 Authentication
- [ ] Test unauthorized access to protected routes
- [ ] Verify redirect to login page
- [ ] Test session expiry
- [ ] Test logout functionality

### 12.2 Authorization
- [ ] Test role-based restrictions
- [ ] Verify server-side action permissions
- [ ] Test tenant isolation in API routes

### 12.3 Input Validation
- [ ] Test SQL injection prevention (Prisma handles this)
- [ ] Test XSS prevention
- [ ] Test CSRF protection (Next.js handles this)

### 12.4 Sensitive Data
- [ ] Verify passwords are hashed (bcrypt)
- [ ] Verify no sensitive data in client-side code
- [ ] Check environment variables are not exposed

---

## 13. Edge Cases & Error Scenarios

### 13.1 Empty States
- [ ] View customers page with no customers
- [ ] View inventory with no items
- [ ] View invoices with no invoices
- [ ] Verify helpful empty state messages

### 13.2 Boundary Values
- [ ] Test with 0 quantity in inventory
- [ ] Test with negative discount (should be prevented)
- [ ] Test with very large numbers
- [ ] Test with decimal precision edge cases

### 13.3 Concurrent Operations
- [ ] Two users editing same invoice simultaneously
- [ ] Two invoices using same inventory item simultaneously
- [ ] Verify database constraints prevent conflicts

### 13.4 Data Import/Export
- [ ] Test database seeding (if available)
- [ ] Test data export (if available)

---

## 14. Critical User Flows (End-to-End)

### 14.1 Complete Repair Job Flow
1. [ ] Customer brings device
2. [ ] Create customer profile
3. [ ] Create job card with device details
4. [ ] Assign technician
5. [ ] Update job status through workflow
6. [ ] Mark as READY
7. [ ] Generate invoice from job card
8. [ ] Complete payment
9. [ ] Print invoice
10. [ ] Verify job status is DELIVERED

### 14.2 Complete Sales Flow
1. [ ] Customer walks in for purchase
2. [ ] Create/select customer
3. [ ] Create invoice
4. [ ] Add inventory items
5. [ ] Verify stock deduction
6. [ ] Apply discount
7. [ ] Calculate tax
8. [ ] Process payment
9. [ ] Print receipt
10. [ ] Send WhatsApp confirmation

### 14.3 Inventory Management Flow
1. [ ] Add new spare part
2. [ ] Set min stock level
3. [ ] Sell items via invoices
4. [ ] Verify low stock alert
5. [ ] Restock items
6. [ ] View stock transaction history

---

## 15. Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (Chrome, Safari)

---

## 16. Deployment & Environment QA

### 16.1 Environment Variables
- [ ] Verify all required env vars are set
- [ ] Test with different database connections
- [ ] Verify NextAuth configuration

### 16.2 Build Process
- [ ] Run `npm run build`
- [ ] Verify no TypeScript errors
- [ ] Verify no build warnings
- [ ] Test production build locally

### 16.3 Database Migrations
- [ ] Run Prisma migrations
- [ ] Verify schema is up-to-date
- [ ] Test seed script

---

## Known Issues & Future Enhancements

### Current Limitations
- Print functionality uses browser print (not server-side PDF generation)
- WhatsApp integration is client-side (opens web.whatsapp.com)
- No email notifications
- No payment gateway integration
- ✅ UPI QR code removed from settings UI (still in DB schema for backward compatibility)

### Future Enhancements
- Server-side PDF generation
- Email invoice delivery
- Payment gateway integration
- Advanced reporting with charts
- Mobile app version
- Barcode scanning for inventory

---

## QA Sign-off

**Tested By:** ___________________  
**Date:** ___________________  
**Environment:** ___________________  
**Build Version:** ___________________  

**Overall Status:**
- [ ] All critical tests passed
- [ ] All major tests passed
- [ ] Minor issues documented
- [ ] System ready for production

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
