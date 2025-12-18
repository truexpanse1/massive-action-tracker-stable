-- ============================================
-- GHL INTEGRATION MIGRATION
-- ============================================
-- This migration adds the necessary tables and columns
-- to enable MAT + GoHighLevel integration
-- ============================================

-- 1. Create ghl_integrations table to store API keys
CREATE TABLE IF NOT EXISTS ghl_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  ghl_api_key TEXT NOT NULL, -- Encrypted GHL Agency API Key
  ghl_location_id TEXT, -- GHL Sub-Account/Location ID
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id) -- One GHL integration per company
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_ghl_integrations_company_id ON ghl_integrations(company_id);
CREATE INDEX IF NOT EXISTS idx_ghl_integrations_active ON ghl_integrations(is_active);

-- 2. Add GHL contact ID to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT UNIQUE;

-- Index for reverse lookups (GHL -> MAT)
CREATE INDEX IF NOT EXISTS idx_clients_ghl_contact_id ON clients(ghl_contact_id);

-- 3. Create appointments table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled
  notes TEXT,
  ghl_event_id TEXT UNIQUE, -- GHL Calendar Event ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_company_id ON appointments(company_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_ghl_event_id ON appointments(ghl_event_id);

-- 4. Create activities table to track all interactions
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- call, email, text, meeting, note
  activity_date DATE NOT NULL,
  notes TEXT,
  ghl_note_id TEXT, -- GHL Note ID (if synced)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activities
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_company_id ON activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_client_id ON activities(client_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);

-- 5. Create revenue_tracking table for deal attribution
CREATE TABLE IF NOT EXISTS revenue_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  deal_amount DECIMAL(10, 2) NOT NULL,
  deal_status VARCHAR(50) NOT NULL, -- won, lost, pending
  closed_date DATE,
  ghl_opportunity_id TEXT UNIQUE, -- GHL Opportunity ID
  product_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for revenue tracking
CREATE INDEX IF NOT EXISTS idx_revenue_user_id ON revenue_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_company_id ON revenue_tracking(company_id);
CREATE INDEX IF NOT EXISTS idx_revenue_client_id ON revenue_tracking(client_id);
CREATE INDEX IF NOT EXISTS idx_revenue_status ON revenue_tracking(deal_status);
CREATE INDEX IF NOT EXISTS idx_revenue_closed_date ON revenue_tracking(closed_date);
CREATE INDEX IF NOT EXISTS idx_revenue_ghl_opportunity_id ON revenue_tracking(ghl_opportunity_id);

-- 6. Add sync metadata columns to clients
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS last_synced_to_ghl TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50) DEFAULT 'pending'; -- pending, synced, error

-- 7. Create webhook_logs table for debugging
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for webhook logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_company_id ON webhook_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);

-- 8. Add RLS (Row Level Security) policies

-- Enable RLS on new tables
ALTER TABLE ghl_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- GHL Integrations policies
CREATE POLICY "Users can view their company's GHL integration"
  ON ghl_integrations FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage their company's GHL integration"
  ON ghl_integrations FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'Admin'));

-- Appointments policies
CREATE POLICY "Users can view their company's appointments"
  ON appointments FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage their own appointments"
  ON appointments FOR ALL
  USING (user_id = auth.uid() OR company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role IN ('Manager', 'Admin')));

-- Activities policies
CREATE POLICY "Users can view their company's activities"
  ON activities FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage their own activities"
  ON activities FOR ALL
  USING (user_id = auth.uid() OR company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role IN ('Manager', 'Admin')));

-- Revenue tracking policies
CREATE POLICY "Users can view their company's revenue"
  ON revenue_tracking FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage their own revenue"
  ON revenue_tracking FOR ALL
  USING (user_id = auth.uid() OR company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role IN ('Manager', 'Admin')));

-- Webhook logs policies (Admin only)
CREATE POLICY "Admins can view webhook logs"
  ON webhook_logs FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'Admin'));

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify all tables and indexes were created
-- 3. Test RLS policies with test users
-- ============================================
