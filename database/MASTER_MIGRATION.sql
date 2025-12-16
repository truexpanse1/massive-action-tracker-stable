-- ============================================================================
-- MASTER DATABASE MIGRATION FOR TRUEXPANSE MAT
-- ============================================================================
-- This migration ensures all required tables and columns exist
-- Safe to run multiple times (uses IF NOT EXISTS)
-- Run this in Supabase SQL Editor to ensure database is up to date
-- ============================================================================

-- ============================================================================
-- COMPANIES TABLE
-- ============================================================================
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sponsored_by_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_gifted_account BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gifted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'disabled'));

-- Create indexes for companies table
CREATE INDEX IF NOT EXISTS idx_companies_stripe_subscription ON companies(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_companies_stripe_customer ON companies(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_companies_sponsored_by ON companies(sponsored_by_user_id);
CREATE INDEX IF NOT EXISTS idx_companies_is_gifted ON companies(is_gifted_account);
CREATE INDEX IF NOT EXISTS idx_companies_account_status ON companies(account_status);

-- ============================================================================
-- USERS TABLE
-- ============================================================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Sales Rep' CHECK (role IN ('Sales Rep', 'Manager', 'Admin'));

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- TARGETS TABLE
-- ============================================================================
ALTER TABLE targets
ADD COLUMN IF NOT EXISTS forwarded_from_date DATE,
ADD COLUMN IF NOT EXISTS forward_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_forwarded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_targets_forwarded_from ON targets(forwarded_from_date);
CREATE INDEX IF NOT EXISTS idx_targets_forward_count ON targets(forward_count);
CREATE INDEX IF NOT EXISTS idx_targets_user_id ON targets(user_id);
CREATE INDEX IF NOT EXISTS idx_targets_date ON targets(date);

-- ============================================================================
-- CLIENTS TABLE
-- ============================================================================
-- Ensure clients table has all necessary columns
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- ============================================================================
-- EOD_REPORTS TABLE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_eod_reports_user_id ON eod_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_eod_reports_date ON eod_reports(date);

-- ============================================================================
-- CLEANUP: Remove any conflicting RLS policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own company users" ON users;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the migration worked:

-- Check companies table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'companies' 
-- ORDER BY ordinal_position;

-- Check users table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- ORDER BY ordinal_position;

-- Check for orphaned auth users
-- SELECT au.id, au.email, au.created_at
-- FROM auth.users au
-- LEFT JOIN users u ON au.id = u.id
-- WHERE u.id IS NULL;

-- ============================================================================
-- END OF MASTER MIGRATION
-- ============================================================================
