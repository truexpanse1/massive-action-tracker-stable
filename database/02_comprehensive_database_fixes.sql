-- ================================================================
-- COMPREHENSIVE DATABASE FIXES FOR MAT APP
-- Run this AFTER running 01_pre_migration_assign_users.sql
-- ================================================================

-- ================================================================
-- PART 1: ADD FOREIGN KEY CONSTRAINTS
-- ================================================================

-- Add foreign key constraint for users.company_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_company_id_fkey' AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint to users.company_id';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists on users.company_id';
  END IF;
END $$;

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

-- Add foreign key constraint for day_data.company_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'day_data_company_id_fkey' AND table_name = 'day_data'
  ) THEN
    ALTER TABLE public.day_data 
    ADD CONSTRAINT day_data_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint to day_data.company_id';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists on day_data.company_id';
  END IF;
END $$;

-- ================================================================
-- PART 2: BACKFILL NULL company_id VALUES
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

-- Backfill day_data.company_id from user's company
UPDATE public.day_data d
SET company_id = u.company_id
FROM public.users u
WHERE d.user_id = u.id 
  AND d.company_id IS NULL 
  AND u.company_id IS NOT NULL;

-- ================================================================
-- PART 3: ENABLE ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eod_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hot_leads ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- PART 4: CREATE RLS POLICIES
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

-- ================================================================
-- PART 5: CREATE INDEXES FOR PERFORMANCE
-- ================================================================

-- Create indexes on company_id columns for faster queries
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON public.clients(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_day_data_company_id ON public.day_data(company_id);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_day_data_user_date ON public.day_data(user_id, date);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);

-- ================================================================
-- PART 6: VERIFICATION
-- ================================================================

-- Check for any remaining NULL company_id values
SELECT 'VERIFICATION RESULTS:' as message;

SELECT 
  'users' as table_name, 
  COUNT(*) as total_rows,
  COUNT(company_id) as rows_with_company,
  COUNT(*) - COUNT(company_id) as rows_without_company
FROM public.users
UNION ALL
SELECT 
  'clients', 
  COUNT(*),
  COUNT(company_id),
  COUNT(*) - COUNT(company_id)
FROM public.clients
UNION ALL
SELECT 
  'contacts', 
  COUNT(*),
  COUNT(company_id),
  COUNT(*) - COUNT(company_id)
FROM public.contacts
UNION ALL
SELECT 
  'day_data', 
  COUNT(*),
  COUNT(company_id),
  COUNT(*) - COUNT(company_id)
FROM public.day_data;

-- ================================================================
-- DONE!
-- ================================================================
SELECT 'Database fixes completed successfully!' as status;
