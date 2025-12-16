-- ================================================================
-- COMPREHENSIVE DATABASE FIXES FOR MAT APP
-- Run this in Supabase SQL Editor to fix all schema and security issues
-- ================================================================

-- ================================================================
-- PART 1: ADD MISSING COLUMNS
-- ================================================================

-- Add company_id to users table (CRITICAL for multi-tenancy)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added company_id column to users table';
  ELSE
    RAISE NOTICE 'company_id column already exists in users table';
  END IF;
END $$;

-- ================================================================
-- PART 2: ADD FOREIGN KEY CONSTRAINTS
-- ================================================================

-- Add foreign key constraint for clients.company_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'clients_company_id_fkey' AND table_name = 'clients'
  ) THEN
    ALTER TABLE public.clients 
    ADD CONSTRAINT clients_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint to clients.company_id';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists on clients.company_id';
  END IF;
END $$;

-- Add foreign key constraint for contacts.company_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'contacts_company_id_fkey' AND table_name = 'contacts'
  ) THEN
    ALTER TABLE public.contacts 
    ADD CONSTRAINT contacts_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint to contacts.company_id';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists on contacts.company_id';
  END IF;
END $$;

-- Add foreign key constraint for transactions.company_id (if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'company_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_company_id_fkey' AND table_name = 'transactions'
  ) THEN
    ALTER TABLE public.transactions 
    ADD CONSTRAINT transactions_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint to transactions.company_id';
  END IF;
END $$;

-- ================================================================
-- PART 3: BACKFILL NULL company_id VALUES
-- ================================================================

-- Backfill clients.company_id from user's company
UPDATE public.clients c
SET company_id = u.company_id
FROM public.users u
WHERE c.user_id = u.id 
  AND c.company_id IS NULL 
  AND u.company_id IS NOT NULL;

-- Backfill contacts.company_id from user's company
UPDATE public.contacts c
SET company_id = u.company_id
FROM public.users u
WHERE c.user_id = u.id 
  AND c.company_id IS NULL 
  AND u.company_id IS NOT NULL;

-- Backfill day_data.company_id from user's company (if needed)
UPDATE public.day_data d
SET company_id = u.company_id
FROM public.users u
WHERE d.user_id = u.id 
  AND d.company_id IS NULL 
  AND u.company_id IS NOT NULL;

-- Backfill transactions.company_id from user's company (if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'company_id'
  ) THEN
    UPDATE public.transactions t
    SET company_id = u.company_id
    FROM public.users u
    WHERE t.user_id = u.id 
      AND t.company_id IS NULL 
      AND u.company_id IS NOT NULL;
    RAISE NOTICE 'Backfilled transactions.company_id';
  END IF;
END $$;

-- ================================================================
-- PART 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on all tables that don't have it
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eod_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- PART 5: CREATE RLS POLICIES
-- ================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own company users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their company clients" ON public.clients;
DROP POLICY IF EXISTS "Users can manage their company clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view their company contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can manage their company contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can view their company day_data" ON public.day_data;
DROP POLICY IF EXISTS "Users can manage their own day_data" ON public.day_data;
DROP POLICY IF EXISTS "Users can view their company transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can manage their company transactions" ON public.transactions;

-- USERS TABLE POLICIES
CREATE POLICY "Users can view their own company users"
  ON public.users
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid());

-- CLIENTS TABLE POLICIES
CREATE POLICY "Users can view their company clients"
  ON public.clients
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their company clients"
  ON public.clients
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- CONTACTS TABLE POLICIES
CREATE POLICY "Users can view their company contacts"
  ON public.contacts
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their company contacts"
  ON public.contacts
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- DAY_DATA TABLE POLICIES
CREATE POLICY "Users can view their company day_data"
  ON public.day_data
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own day_data"
  ON public.day_data
  FOR ALL
  USING (user_id = auth.uid());

-- TRANSACTIONS TABLE POLICIES
CREATE POLICY "Users can view their company transactions"
  ON public.transactions
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their company transactions"
  ON public.transactions
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- ================================================================
-- PART 6: CREATE INDEXES FOR PERFORMANCE
-- ================================================================

-- Create indexes on company_id columns for faster queries
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON public.clients(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_day_data_company_id ON public.day_data(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON public.transactions(company_id);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_day_data_user_date ON public.day_data(user_id, date);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check for any remaining NULL company_id values
SELECT 'clients' as table_name, COUNT(*) as null_company_ids 
FROM public.clients WHERE company_id IS NULL
UNION ALL
SELECT 'contacts', COUNT(*) 
FROM public.contacts WHERE company_id IS NULL
UNION ALL
SELECT 'users', COUNT(*) 
FROM public.users WHERE company_id IS NULL
UNION ALL
SELECT 'day_data', COUNT(*) 
FROM public.day_data WHERE company_id IS NULL;

-- ================================================================
-- DONE!
-- ================================================================
SELECT 'Database fixes completed successfully!' as status;
