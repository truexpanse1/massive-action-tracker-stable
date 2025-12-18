-- MAT + GHL Integration Database Migration (FINAL - CORRECTED)
-- Run this in Supabase SQL Editor

-- 1. Create GHL integrations table
CREATE TABLE IF NOT EXISTS ghl_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  ghl_api_key TEXT NOT NULL,
  ghl_location_id TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add GHL columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT,
ADD COLUMN IF NOT EXISTS last_synced_to_ghl TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'pending';

-- 3. Create appointments table (client_id is BIGINT to match clients.id)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled',
  ghl_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create revenue_tracking table (client_id is BIGINT to match clients.id)
CREATE TABLE IF NOT EXISTS revenue_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  deal_amount DECIMAL(10, 2),
  deal_status TEXT,
  closed_date DATE,
  product_name TEXT,
  ghl_opportunity_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create webhook logs table for debugging
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_ghl_contact_id ON clients(ghl_contact_id);
CREATE INDEX IF NOT EXISTS idx_ghl_integrations_company_id ON ghl_integrations(company_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_ghl_event_id ON appointments(ghl_event_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_company_id ON revenue_tracking(company_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_client_id ON revenue_tracking(client_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_ghl_opportunity_id ON revenue_tracking(ghl_opportunity_id);

-- 7. Enable Row Level Security
ALTER TABLE ghl_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for ghl_integrations
DROP POLICY IF EXISTS "Users can view their company's GHL integration" ON ghl_integrations;
CREATE POLICY "Users can view their company's GHL integration"
  ON ghl_integrations FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage GHL integrations" ON ghl_integrations;
CREATE POLICY "Admins can manage GHL integrations"
  ON ghl_integrations FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- 9. Create RLS policies for appointments
DROP POLICY IF EXISTS "Users can view their company's appointments" ON appointments;
CREATE POLICY "Users can view their company's appointments"
  ON appointments FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage appointments" ON appointments;
CREATE POLICY "Users can manage appointments"
  ON appointments FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- 10. Create RLS policies for revenue_tracking
DROP POLICY IF EXISTS "Users can view their company's revenue" ON revenue_tracking;
CREATE POLICY "Users can view their company's revenue"
  ON revenue_tracking FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert revenue for their company" ON revenue_tracking;
CREATE POLICY "Users can insert revenue for their company"
  ON revenue_tracking FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- 11. Create RLS policies for webhook_logs (service role only)
DROP POLICY IF EXISTS "Service role can manage webhook logs" ON webhook_logs;
CREATE POLICY "Service role can manage webhook logs"
  ON webhook_logs FOR ALL
  USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'GHL Integration migration completed successfully!';
END $$;
