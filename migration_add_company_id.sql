-- Migration: Add company_id to data tables for manager view support
-- This allows managers to see all team member data filtered by company

-- ============================================
-- 1. ADD company_id COLUMN TO TABLES
-- ============================================

-- Add company_id to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Add company_id to hot_leads table
ALTER TABLE hot_leads 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Add company_id to day_data table
ALTER TABLE day_data 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Add company_id to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- ============================================
-- 2. BACKFILL EXISTING DATA
-- ============================================

-- Update transactions with company_id from users table
UPDATE transactions t
SET company_id = u.company_id
FROM users u
WHERE t.user_id = u.id
AND t.company_id IS NULL;

-- Update hot_leads with company_id from users table
UPDATE hot_leads hl
SET company_id = u.company_id
FROM users u
WHERE hl.user_id = u.id
AND hl.company_id IS NULL;

-- Update day_data with company_id from users table
UPDATE day_data dd
SET company_id = u.company_id
FROM users u
WHERE dd.user_id = u.id
AND dd.company_id IS NULL;

-- Update quotes with company_id from users table
UPDATE quotes q
SET company_id = u.company_id
FROM users u
WHERE q.user_id = u.id
AND q.company_id IS NULL;

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Index on transactions.company_id for fast manager queries
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);

-- Index on hot_leads.company_id
CREATE INDEX IF NOT EXISTS idx_hot_leads_company_id ON hot_leads(company_id);

-- Index on day_data.company_id
CREATE INDEX IF NOT EXISTS idx_day_data_company_id ON day_data(company_id);

-- Index on quotes.company_id
CREATE INDEX IF NOT EXISTS idx_quotes_company_id ON quotes(company_id);

-- ============================================
-- 4. VERIFY DATA INTEGRITY
-- ============================================

-- Check for any orphaned records (should return 0)
SELECT 'Transactions without company_id' as check_name, COUNT(*) as count
FROM transactions WHERE company_id IS NULL
UNION ALL
SELECT 'Hot leads without company_id', COUNT(*)
FROM hot_leads WHERE company_id IS NULL
UNION ALL
SELECT 'Day data without company_id', COUNT(*)
FROM day_data WHERE company_id IS NULL
UNION ALL
SELECT 'Quotes without company_id', COUNT(*)
FROM quotes WHERE company_id IS NULL;
