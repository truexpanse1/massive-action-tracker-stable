# TrueXpanse MAT - Database Schema Documentation

## Overview
This document describes the complete database schema for the Massive Action Tracker (MAT) application.

---

## Tables

### **companies**
Stores company/organization information and subscription details.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| name | VARCHAR | NO | - | Company name |
| created_at | TIMESTAMPTZ | NO | now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NO | now() | Last update timestamp |
| subscription_tier | VARCHAR(50) | YES | 'starter' | Plan tier (solo/team/elite/starter/gifted) |
| stripe_subscription_id | VARCHAR(255) | YES | NULL | Stripe subscription ID |
| stripe_customer_id | VARCHAR(255) | YES | NULL | Stripe customer ID |
| max_users | INTEGER | YES | 5 | Maximum allowed users |
| cancellation_requested_at | TIMESTAMPTZ | YES | NULL | When cancellation was requested |
| sponsored_by_user_id | UUID | YES | NULL | User ID of sponsor (for gifted accounts) |
| is_gifted_account | BOOLEAN | YES | FALSE | Whether this is a gifted account |
| gifted_at | TIMESTAMPTZ | YES | NULL | When account was gifted |
| account_status | VARCHAR(20) | YES | 'active' | Account status (active/disabled) |

**Indexes:**
- `idx_companies_stripe_subscription` on `stripe_subscription_id`
- `idx_companies_stripe_customer` on `stripe_customer_id`
- `idx_companies_sponsored_by` on `sponsored_by_user_id`
- `idx_companies_is_gifted` on `is_gifted_account`
- `idx_companies_account_status` on `account_status`

**Foreign Keys:**
- `sponsored_by_user_id` → `auth.users(id)`

---

### **users**
Stores user profiles and roles.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | - | Primary key (matches auth.users.id) |
| email | VARCHAR | NO | - | User email |
| name | VARCHAR | NO | - | User full name |
| company_id | UUID | NO | - | Company this user belongs to |
| role | VARCHAR(50) | YES | 'Sales Rep' | User role (Sales Rep/Manager/Admin) |
| status | VARCHAR(20) | YES | 'active' | User status |
| created_at | TIMESTAMPTZ | NO | now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NO | now() | Last update timestamp |

**Indexes:**
- `idx_users_role` on `role`
- `idx_users_company_id` on `company_id`
- `idx_users_email` on `email`

**Foreign Keys:**
- `id` → `auth.users(id)`
- `company_id` → `companies(id)`

**Constraints:**
- `role` CHECK: Must be one of ('Sales Rep', 'Manager', 'Admin')

---

### **targets**
Stores daily targets/goals for users.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| user_id | UUID | NO | - | User who owns this target |
| date | DATE | NO | - | Date for this target |
| target_text | TEXT | NO | - | Target description |
| completed | BOOLEAN | YES | FALSE | Whether target is completed |
| forwarded_from_date | DATE | YES | NULL | Original date if forwarded |
| forward_count | INTEGER | YES | 0 | Number of times forwarded |
| last_forwarded_at | TIMESTAMPTZ | YES | NULL | Last forward timestamp |
| created_at | TIMESTAMPTZ | NO | now() | Creation timestamp |

**Indexes:**
- `idx_targets_user_id` on `user_id`
- `idx_targets_date` on `date`
- `idx_targets_forwarded_from` on `forwarded_from_date`
- `idx_targets_forward_count` on `forward_count`

**Foreign Keys:**
- `user_id` → `users(id)`

---

### **clients**
Stores client/prospect information.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| user_id | UUID | NO | User who owns this client |
| company_id | UUID | NO | Company this client belongs to |
| name | VARCHAR | NO | Client name |
| email | VARCHAR | YES | Client email |
| phone | VARCHAR | YES | Client phone |
| status | VARCHAR | YES | Client status (lead/prospect/customer) |
| created_at | TIMESTAMPTZ | NO | Creation timestamp |
| updated_at | TIMESTAMPTZ | NO | Last update timestamp |

**Indexes:**
- `idx_clients_user_id` on `user_id`
- `idx_clients_company_id` on `company_id`
- `idx_clients_status` on `status`

**Foreign Keys:**
- `user_id` → `users(id)`
- `company_id` → `companies(id)`

---

### **eod_reports**
Stores End of Day reports.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| user_id | UUID | NO | User who submitted this report |
| date | DATE | NO | Report date |
| wins | TEXT | YES | Wins for the day |
| challenges | TEXT | YES | Challenges faced |
| lessons | TEXT | YES | Lessons learned |
| created_at | TIMESTAMPTZ | NO | Creation timestamp |

**Indexes:**
- `idx_eod_reports_user_id` on `user_id`
- `idx_eod_reports_date` on `date`

**Foreign Keys:**
- `user_id` → `users(id)`

---

## Account Types

### **Regular Account**
- Created via Stripe checkout on landing page
- Has `stripe_subscription_id` and `stripe_customer_id`
- `is_gifted_account` = FALSE
- `sponsored_by_user_id` = NULL

### **Gifted Account (GHL Billing)**
- Created by Admin/Manager via "Add Account"
- `is_gifted_account` = TRUE
- `sponsored_by_user_id` = (sponsor's user ID)
- `subscription_tier` = 'gifted' or plan tier
- NO Stripe IDs (billed externally in GHL)

### **Gifted Account (Stripe Billing)**
- Created by Admin/Manager via "Add Account"
- `is_gifted_account` = TRUE
- `sponsored_by_user_id` = (sponsor's user ID)
- Has `stripe_subscription_id` (they pay Stripe directly)

### **Team Member**
- Added to existing company
- Shares company's subscription
- `is_gifted_account` = FALSE
- `sponsored_by_user_id` = NULL

---

## User Roles

| Role | Permissions |
|------|-------------|
| **Sales Rep** | - View own data<br>- Create/edit own targets, clients, EOD reports<br>- View own company info |
| **Manager** | - All Sales Rep permissions<br>- View team data<br>- Add team members<br>- Create gifted accounts |
| **Admin** | - All Manager permissions<br>- Manage company settings<br>- Cancel subscriptions<br>- Full access to all features |

---

## Migration Status

Run `/database/MASTER_MIGRATION.sql` to ensure all columns and indexes exist.

**Last Updated:** December 16, 2025
