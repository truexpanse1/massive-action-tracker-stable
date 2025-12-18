-- ============================================
-- GHL AUTO-SYNC TRIGGER
-- ============================================
-- This trigger automatically queues clients for GHL sync
-- when they are created or updated
-- ============================================

-- Create a function to handle the trigger
CREATE OR REPLACE FUNCTION trigger_ghl_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Set sync_status to 'pending' for new clients
  IF TG_OP = 'INSERT' THEN
    NEW.sync_status := 'pending';
    NEW.last_synced_to_ghl := NULL;
  END IF;
  
  -- If client data changed and they have a ghl_contact_id, mark for re-sync
  IF TG_OP = 'UPDATE' THEN
    IF (NEW.name IS DISTINCT FROM OLD.name OR 
        NEW.email IS DISTINCT FROM OLD.email OR 
        NEW.phone IS DISTINCT FROM OLD.phone) AND
        NEW.ghl_contact_id IS NOT NULL THEN
      NEW.sync_status := 'pending';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on clients table
DROP TRIGGER IF EXISTS ghl_sync_trigger ON clients;
CREATE TRIGGER ghl_sync_trigger
  BEFORE INSERT OR UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION trigger_ghl_sync();

-- ============================================
-- EDGE FUNCTION FOR BACKGROUND SYNC
-- ============================================
-- This would be implemented as a Supabase Edge Function
-- that runs periodically to sync pending clients
-- 
-- Example implementation (to be created separately):
-- 
-- import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
-- import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
-- 
-- serve(async (req) => {
--   const supabase = createClient(...)
--   
--   // Get all pending clients
--   const { data: clients } = await supabase
--     .from('clients')
--     .select('*')
--     .eq('sync_status', 'pending')
--     .limit(10)
--   
--   // Sync each client to GHL
--   for (const client of clients) {
--     await syncClientToGHL(client.id)
--   }
--   
--   return new Response('OK')
-- })
