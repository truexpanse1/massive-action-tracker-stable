-- ================================================================
-- PRE-MIGRATION: Assign Users to Companies
-- Run this FIRST before the comprehensive database fixes
-- ================================================================

-- Step 1: Add company_id column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN company_id UUID;
    RAISE NOTICE 'Added company_id column to users table';
  ELSE
    RAISE NOTICE 'company_id column already exists in users table';
  END IF;
END $$;

-- Step 2: Assign TrueXpanse users to TrueXpanse company
-- TrueXpanse company ID: b237eea8-7313-4a00-bc44-e3181c041c63
UPDATE public.users
SET company_id = 'b237eea8-7313-4a00-bc44-e3181c041c63'
WHERE email IN (
  'earl@truexpanse.com',
  'don@truexpanse.com',
  'j@truexpanse.com',
  'traci@truexpanse.com'
) AND company_id IS NULL;

-- Step 3: Assign David White to TrueXpanse (assuming he's part of the team)
UPDATE public.users
SET company_id = 'b237eea8-7313-4a00-bc44-e3181c041c63'
WHERE email = 'hvac.advanced@yahoo.com' AND company_id IS NULL;

-- Step 4: Assign test user George to Test Company B
-- Test Company B ID: 42426f6b-d623-4265-aabc-cb11de5bf4cb
UPDATE public.users
SET company_id = '42426f6b-d623-4265-aabc-cb11de5bf4cb'
WHERE email = 'test2@example.com' AND company_id IS NULL;

-- Step 5: Verify all users have been assigned
SELECT 
  u.name,
  u.email,
  u.role,
  c.name as company_name,
  CASE 
    WHEN u.company_id IS NULL THEN '❌ NOT ASSIGNED'
    ELSE '✅ ASSIGNED'
  END as status
FROM public.users u
LEFT JOIN public.companies c ON u.company_id = c.id
ORDER BY u.created_at;

-- ================================================================
-- DONE! Now you can run the comprehensive database fixes
-- ================================================================
