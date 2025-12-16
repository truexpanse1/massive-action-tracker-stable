# TrueXpanse MAT - Deployment Checklist

This checklist ensures all housekeeping changes are properly deployed and tested.

---

## Pre-Deployment Steps

### 1. Database Migration ⏳

**Action:** Run the master migration script in Supabase

**Steps:**
1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Copy contents of `/database/MASTER_MIGRATION.sql`
4. Paste and execute
5. Verify success message appears

**Verification:**
```sql
-- Check companies table has all columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'companies' 
ORDER BY ordinal_position;

-- Should include:
-- - subscription_tier (varchar)
-- - stripe_subscription_id (varchar)
-- - stripe_customer_id (varchar)
-- - sponsored_by_user_id (uuid)
-- - is_gifted_account (boolean)
-- - gifted_at (timestamptz)
-- - account_status (varchar)
-- - cancellation_requested_at (timestamptz)
```

---

### 2. Update Admin Role ⏳

**Action:** Set don@truexpanse.com to Admin role

**SQL:**
```sql
UPDATE users 
SET role = 'Admin' 
WHERE email = 'don@truexpanse.com';

-- Verify
SELECT email, role FROM users WHERE email = 'don@truexpanse.com';
```

---

### 3. Environment Variables Check ⏳

**Action:** Verify all required environment variables are set in Netlify

**Required Variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`

**Steps:**
1. Go to Netlify Dashboard
2. Navigate to Site Settings → Environment Variables
3. Verify all variables are present
4. Check that values are correct (no trailing spaces, quotes, etc.)

---

## Deployment Steps

### 4. Commit Changes ⏳

**Action:** Commit all changes to GitHub

**Files to Commit:**
```bash
# New files
massive-action-tracker-stable/api/create-team-member.ts
massive-action-tracker-stable/api/create-gifted-account.ts
massive-action-tracker-stable/DATABASE_SCHEMA.md
massive-action-tracker-stable/HOUSEKEEPING_SUMMARY.md
massive-action-tracker-stable/API_DOCUMENTATION.md
massive-action-tracker-stable/DEPLOYMENT_CHECKLIST.md

# Modified files
massive-action-tracker-stable/api/stripe-webhook.ts
```

**Commands:**
```bash
cd /home/ubuntu/massive-action-tracker-stable
git add .
git commit -m "Housekeeping: Fix database schema, rebuild account creation, add documentation"
git push origin main
```

---

### 5. Monitor Netlify Deploy ⏳

**Action:** Watch Netlify auto-deploy and verify success

**Steps:**
1. Go to Netlify Dashboard
2. Navigate to Deploys
3. Wait for deploy to complete
4. Check for any build errors
5. Verify deploy succeeded

---

## Post-Deployment Testing

### 6. Test Account Creation ⏳

#### Test 1: Create Team Member
**Steps:**
1. Login as don@truexpanse.com
2. Go to Account Settings
3. Click "Add Account"
4. Select "Team Member"
5. Fill in details:
   - Email: test-team@example.com
   - Name: Test Team Member
   - Password: testpass123
6. Submit

**Expected Result:**
- ✅ Success message appears
- ✅ New user can login
- ✅ New user has role "Sales Rep"
- ✅ New user belongs to same company as don@truexpanse.com

---

#### Test 2: Create GHL Gifted Account
**Steps:**
1. Login as don@truexpanse.com
2. Go to Account Settings
3. Click "Add Account"
4. Select "Standalone Account"
5. Select "GHL Billing"
6. Select plan (Solo/Team/Elite)
7. Fill in details:
   - Email: test-ghl@example.com
   - Name: Test GHL User
   - Company: Test GHL Company
   - Password: testpass123
8. Submit

**Expected Result:**
- ✅ Success message appears
- ✅ New user can login
- ✅ New user has role "Admin"
- ✅ New company created
- ✅ Company has `is_gifted_account` = TRUE
- ✅ Company has `sponsored_by_user_id` = don's user ID
- ✅ No Stripe IDs in company record

**Verification SQL:**
```sql
SELECT 
  c.name,
  c.subscription_tier,
  c.is_gifted_account,
  c.sponsored_by_user_id,
  c.stripe_subscription_id,
  u.email,
  u.role
FROM companies c
JOIN users u ON u.company_id = c.id
WHERE u.email = 'test-ghl@example.com';
```

---

#### Test 3: Create Stripe Gifted Account
**Steps:**
1. Login as don@truexpanse.com
2. Go to Account Settings
3. Click "Add Account"
4. Select "Standalone Account"
5. Select "Stripe Billing"
6. Select plan (Solo/Team/Elite)
7. Fill in details:
   - Email: test-stripe@example.com
   - Name: Test Stripe User
   - Company: Test Stripe Company
   - Password: testpass123
8. Submit

**Expected Result:**
- ✅ Success message appears
- ✅ New user can login
- ✅ New user has role "Admin"
- ✅ New company created
- ✅ Company has `is_gifted_account` = TRUE
- ✅ Company has `sponsored_by_user_id` = don's user ID
- ✅ User will need to set up Stripe subscription separately

---

### 7. Test Error Handling ⏳

#### Test 1: Duplicate Email
**Steps:**
1. Try to create account with existing email
2. Verify error message appears
3. Verify no orphaned records created

**Expected Result:**
- ✅ Error: "Email already exists"
- ✅ No new auth user created
- ✅ No new user record created

---

#### Test 2: Invalid Email
**Steps:**
1. Try to create account with invalid email (e.g., "notanemail")
2. Verify error message appears

**Expected Result:**
- ✅ Error: "Invalid email format"

---

#### Test 3: Short Password
**Steps:**
1. Try to create account with password "12345"
2. Verify error message appears

**Expected Result:**
- ✅ Error: "Password must be at least 6 characters"

---

### 8. Test Role-Based Access Control ⏳

#### Test 1: Admin Can See Add Account
**Steps:**
1. Login as don@truexpanse.com (Admin)
2. Go to Account Settings
3. Verify "Add Account" button is visible

**Expected Result:**
- ✅ "Add Account" button visible

---

#### Test 2: Sales Rep Cannot See Add Account
**Steps:**
1. Login as a Sales Rep user
2. Go to Account Settings
3. Verify "Add Account" button is NOT visible

**Expected Result:**
- ✅ "Add Account" button hidden
- ✅ Account Management section not displayed

---

### 9. Test Cancellation ⏳

**Steps:**
1. Login as any user
2. Go to Account Settings
3. Click "Cancel Subscription"
4. Confirm cancellation
5. Check don@truexpanse.com email

**Expected Result:**
- ✅ Success message appears
- ✅ Email received at don@truexpanse.com
- ✅ Email contains user details and cancellation reason
- ✅ `cancellation_requested_at` timestamp set in database

**Verification SQL:**
```sql
SELECT 
  c.name,
  c.cancellation_requested_at,
  u.email
FROM companies c
JOIN users u ON u.company_id = c.id
WHERE c.cancellation_requested_at IS NOT NULL;
```

---

## Cleanup Test Data

After testing is complete, clean up test accounts:

```sql
-- Find test users
SELECT u.id, u.email, u.company_id 
FROM users u 
WHERE u.email LIKE 'test-%@example.com';

-- Delete test users (replace UUIDs with actual values)
DELETE FROM users WHERE email = 'test-team@example.com';
DELETE FROM users WHERE email = 'test-ghl@example.com';
DELETE FROM users WHERE email = 'test-stripe@example.com';

-- Delete test companies (replace UUIDs with actual values)
DELETE FROM companies WHERE name LIKE 'Test % Company';

-- Delete test auth users (in Supabase Auth dashboard)
```

---

## Final Verification

### Database Health Check
```sql
-- Check for orphaned auth users
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- Check for companies without users
SELECT c.id, c.name
FROM companies c
LEFT JOIN users u ON u.company_id = c.id
WHERE u.id IS NULL;

-- Check subscription tiers
SELECT subscription_tier, COUNT(*) 
FROM companies 
GROUP BY subscription_tier;

-- Check gifted accounts
SELECT 
  COUNT(*) as total_gifted,
  COUNT(CASE WHEN sponsored_by_user_id IS NOT NULL THEN 1 END) as with_sponsor
FROM companies
WHERE is_gifted_account = TRUE;
```

---

## Success Criteria

All items must be checked before deployment is considered complete:

- [ ] Database migration executed successfully
- [ ] don@truexpanse.com has Admin role
- [ ] All environment variables verified
- [ ] Changes committed and pushed to GitHub
- [ ] Netlify deploy succeeded
- [ ] Team member creation works
- [ ] GHL gifted account creation works
- [ ] Stripe gifted account creation works
- [ ] Error handling works (duplicate email, invalid format, short password)
- [ ] Role-based access control works (Admin sees button, Sales Rep doesn't)
- [ ] Cancellation request works and sends email
- [ ] Test data cleaned up
- [ ] Database health check passes

---

## Rollback Plan

If deployment fails or critical issues are found:

1. **Revert Git Commit:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Rollback Database (if needed):**
   ```sql
   -- Remove added columns (only if absolutely necessary)
   ALTER TABLE companies DROP COLUMN IF EXISTS stripe_subscription_id;
   ALTER TABLE companies DROP COLUMN IF EXISTS sponsored_by_user_id;
   -- etc.
   ```

3. **Notify Stakeholders:**
   - Email don@truexpanse.com
   - Document issues found
   - Create plan to fix and redeploy

---

**Deployment Date:** _________________  
**Deployed By:** _________________  
**Status:** _________________  

---

**Last Updated:** December 16, 2025
