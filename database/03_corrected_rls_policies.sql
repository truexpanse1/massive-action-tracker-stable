-- ================================================================
-- CORRECTED RLS POLICIES (No Circular Dependencies)
-- Run this when you're ready to enable RLS for multi-tenancy
-- ================================================================

-- ================================================================
-- STEP 1: DROP OLD POLICIES
-- ================================================================

DROP POLICY IF EXISTS "Users can view their own company users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their company clients" ON public.clients;
DROP POLICY IF EXISTS "Users can manage their company clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view their company contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can manage their company contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can view their company day_data" ON public.day_data;
DROP POLICY IF EXISTS "Users can manage their own day_data" ON public.day_data;

-- ================================================================
-- STEP 2: CREATE CORRECTED POLICIES
-- ================================================================

-- USERS TABLE POLICIES (Fixed - No Circular Dependency)
-- Allow users to read their own record directly
CREATE POLICY "Users can view their own record"
  ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid());

-- CLIENTS TABLE POLICIES
-- Users can only see clients from their own company
CREATE POLICY "Users can view their company clients"
  ON public.clients
  FOR SELECT
  USING (
    company_id = (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Users can insert/update/delete clients in their own company
CREATE POLICY "Users can manage their company clients"
  ON public.clients
  FOR ALL
  USING (
    company_id = (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- CONTACTS TABLE POLICIES (Hot Leads)
-- Users can only see contacts from their own company
CREATE POLICY "Users can view their company contacts"
  ON public.contacts
  FOR SELECT
  USING (
    company_id = (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Users can manage contacts in their own company
CREATE POLICY "Users can manage their company contacts"
  ON public.contacts
  FOR ALL
  USING (
    company_id = (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- DAY_DATA TABLE POLICIES
-- Users can view day_data from their own company
CREATE POLICY "Users can view their company day_data"
  ON public.day_data
  FOR SELECT
  USING (
    company_id = (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Users can only manage their own day_data
CREATE POLICY "Users can manage their own day_data"
  ON public.day_data
  FOR INSERT, UPDATE, DELETE
  USING (user_id = auth.uid());

-- CALENDAR_EVENTS TABLE POLICIES
CREATE POLICY "Users can view their company calendar events"
  ON public.calendar_events
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.users 
      WHERE company_id = (SELECT company_id FROM public.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their own calendar events"
  ON public.calendar_events
  FOR ALL
  USING (user_id = auth.uid());

-- HOT_LEADS TABLE POLICIES (if different from contacts)
DROP POLICY IF EXISTS "Users can view their company hot_leads" ON public.hot_leads;
DROP POLICY IF EXISTS "Users can manage their company hot_leads" ON public.hot_leads;

CREATE POLICY "Users can view their company hot_leads"
  ON public.hot_leads
  FOR SELECT
  USING (
    company_id = (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their company hot_leads"
  ON public.hot_leads
  FOR ALL
  USING (
    company_id = (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- ================================================================
-- STEP 3: ENABLE RLS ON ALL TABLES
-- ================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hot_leads ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- VERIFICATION
-- ================================================================

-- Check that policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ================================================================
-- DONE!
-- ================================================================
SELECT 'Corrected RLS policies created successfully!' as status;
