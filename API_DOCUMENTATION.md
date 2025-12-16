# TrueXpanse MAT - API Documentation

This document describes all backend API endpoints (Netlify Functions) used in the Massive Action Tracker.

---

## Authentication

All API endpoints use **Supabase Service Role Key** for admin-level operations. This key is stored in environment variables and should never be exposed to the frontend.

---

## Endpoints

### 1. Create Team Member

**Endpoint:** `/.netlify/functions/create-team-member`  
**Method:** POST  
**Purpose:** Add a new team member to an existing company

**Request Body:**
```json
{
  "companyId": "uuid-of-company",
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Team member created successfully",
  "userId": "uuid-of-new-user",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response (Error):**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

**Validation:**
- All fields are required
- Email must be valid format
- Password must be at least 6 characters
- Email must not already exist
- Company must exist
- Company must not have reached max_users limit

**Rollback:** If user record creation fails, the auth user is automatically deleted.

---

### 2. Create Gifted Account

**Endpoint:** `/.netlify/functions/create-gifted-account`  
**Method:** POST  
**Purpose:** Create a standalone account (GHL-billed or Stripe-billed) gifted by an Admin/Manager

**Request Body:**
```json
{
  "sponsorUserId": "uuid-of-sponsor",
  "email": "user@example.com",
  "name": "Jane Smith",
  "companyName": "Acme Corp",
  "password": "securepassword123",
  "billingType": "ghl",
  "plan": "solo"
}
```

**Fields:**
- `sponsorUserId`: UUID of the user creating the gifted account (Admin/Manager)
- `email`: Email for the new account
- `name`: Full name of the new user
- `companyName`: Name for the new company
- `password`: Password for the new account
- `billingType`: Either "ghl" (billed via GoHighLevel) or "stripe" (billed via Stripe)
- `plan`: Either "solo" (1 user), "team" (5 users), or "elite" (10 users)

**Response (Success):**
```json
{
  "success": true,
  "message": "Gifted account created successfully",
  "userId": "uuid-of-new-user",
  "companyId": "uuid-of-new-company",
  "email": "user@example.com",
  "name": "Jane Smith",
  "companyName": "Acme Corp"
}
```

**Response (Error):**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

**Validation:**
- All required fields must be present
- Email must be valid format
- Password must be at least 6 characters
- Email must not already exist

**Rollback:** 
- If user record creation fails, both the company and auth user are deleted
- If company creation fails, the auth user is deleted

**Database Changes:**
- Creates new company with:
  - `max_users` based on plan (solo=1, team=5, elite=10)
  - `subscription_tier` = 'gifted' (for GHL) or plan name (for Stripe)
  - `sponsored_by_user_id` = sponsorUserId (for GHL only)
  - `is_gifted_account` = TRUE (for GHL only)
  - `gifted_at` = current timestamp (for GHL only)
- Creates new user with role = 'Admin' (they own their company)

---

### 3. Cancel Subscription

**Endpoint:** `/.netlify/functions/cancel-subscription`  
**Method:** POST  
**Purpose:** Request cancellation of a subscription (sends email to don@truexpanse.com)

**Request Body:**
```json
{
  "companyId": "uuid-of-company",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "reason": "No longer needed"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Cancellation request submitted successfully"
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

**Behavior:**
- Sends email notification to don@truexpanse.com
- Updates `companies.cancellation_requested_at` timestamp
- Does NOT automatically cancel in Stripe (manual review required)

---

### 4. Create Checkout Session

**Endpoint:** `/.netlify/functions/create-checkout-session`  
**Method:** POST  
**Purpose:** Create a Stripe checkout session for new subscriptions

**Request Body:**
```json
{
  "planName": "team",
  "email": "user@example.com",
  "fullName": "John Doe",
  "company": "Acme Corp",
  "phone": "+1234567890"
}
```

**Response (Success):**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

**Pricing:**
- **Solo:** $39/month (1 user)
- **Team:** $149/month (5 users)
- **Elite:** $399/month (10 users)

**Metadata Stored:**
- fullName
- company
- phone
- planName

This metadata is used by the webhook to create the user and company records.

---

### 5. Stripe Webhook

**Endpoint:** `/.netlify/functions/stripe-webhook`  
**Method:** POST  
**Purpose:** Handle Stripe webhook events (checkout.session.completed)

**Webhook Events Handled:**
- `checkout.session.completed`: Creates user and company when subscription payment succeeds

**Process:**
1. Verify webhook signature
2. Extract user data from session metadata
3. Create auth user in Supabase
4. Create company record with Stripe IDs
5. Create user record
6. Send notification email to don@truexpanse.com

**Automatic Rollback:**
- If company creation fails → deletes auth user
- If user record creation fails → deletes company and auth user

---

### 6. Check Subscription Status

**Endpoint:** `/.netlify/functions/check-subscription-status`  
**Method:** POST  
**Purpose:** Verify if a user's subscription is active (used during login)

**Request Body:**
```json
{
  "userId": "uuid-of-user"
}
```

**Response (Active):**
```json
{
  "active": true,
  "subscription_tier": "team"
}
```

**Response (Inactive):**
```json
{
  "active": false,
  "reason": "Subscription expired"
}
```

**Checks:**
- Company exists
- `account_status` = 'active'
- `cancellation_requested_at` is NULL or in future

---

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 404 | Not Found (company/user doesn't exist) |
| 405 | Method Not Allowed |
| 500 | Internal Server Error |

---

## Environment Variables Required

All API functions require these environment variables:

```bash
VITE_SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
RESEND_API_KEY=<your-resend-api-key>
```

---

## Security Notes

**Service Role Key:** The Supabase Service Role Key bypasses Row Level Security (RLS) policies. It should only be used in backend functions, never exposed to the frontend.

**Webhook Signature Verification:** All Stripe webhooks are verified using the webhook secret to prevent unauthorized requests.

**Email Validation:** All email addresses are validated using regex before creating accounts.

**Password Requirements:** Minimum 6 characters enforced on all account creation endpoints.

---

## Testing

Use tools like **Postman** or **curl** to test these endpoints:

```bash
# Test create team member
curl -X POST https://your-site.netlify.app/.netlify/functions/create-team-member \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "uuid-here",
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

---

**Last Updated:** December 16, 2025
