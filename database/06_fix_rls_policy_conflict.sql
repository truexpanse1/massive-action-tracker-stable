-- Fix RLS Policy Conflict
-- The error shows: policy "Users can view their own company users" for table "users" already exists
-- This script drops the existing policy so the migration can proceed

-- Drop the conflicting policy if it exists
DROP POLICY IF EXISTS "Users can view their own company users" ON users;

-- Note: RLS is currently DISABLED for the app to work
-- This is just cleaning up the conflicting policy definition
-- If you want to enable RLS in the future, use the corrected policies in 03_corrected_rls_policies.sql
