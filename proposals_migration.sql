-- Proposals Table Migration
-- Creates table for storing AI-generated proposals

CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Basic Info
  slug VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'signed', 'paid')),
  
  -- Client Information
  client_company_name VARCHAR(255) NOT NULL,
  client_contact_name VARCHAR(255),
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  client_industry VARCHAR(100),
  
  -- Research & Discovery
  client_problems TEXT,
  client_goals TEXT,
  client_competitive_landscape TEXT,
  client_current_marketing JSONB,
  
  -- Proposal Details
  monthly_investment DECIMAL(10,2) DEFAULT 750.00,
  services_included JSONB,
  custom_message TEXT,
  
  -- AI-Generated Content
  ai_problem_analysis TEXT,
  ai_solution_narrative TEXT,
  ai_content_strategy TEXT,
  ai_roi_projection TEXT,
  
  -- Client Branding
  client_logo_url TEXT,
  client_brand_colors JSONB,
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  
  -- Conversion Tracking
  signed_at TIMESTAMPTZ,
  signature_data JSONB,
  payment_amount DECIMAL(10,2),
  paid_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_company_id ON proposals(company_id);
CREATE INDEX IF NOT EXISTS idx_proposals_slug ON proposals(slug);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_proposals_updated_at();

-- RLS Policies
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Users can view their own proposals
CREATE POLICY "Users can view own proposals"
  ON proposals FOR SELECT
  USING (user_id = auth.uid());

-- Users can create proposals
CREATE POLICY "Users can create proposals"
  ON proposals FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own proposals
CREATE POLICY "Users can update own proposals"
  ON proposals FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own proposals
CREATE POLICY "Users can delete own proposals"
  ON proposals FOR DELETE
  USING (user_id = auth.uid());

-- Managers/Admins can view all company proposals
CREATE POLICY "Managers can view company proposals"
  ON proposals FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid() AND role IN ('Manager', 'Admin')
    )
  );

-- Public can view proposals by slug (for prospect viewing)
CREATE POLICY "Public can view proposals by slug"
  ON proposals FOR SELECT
  USING (true);

COMMENT ON TABLE proposals IS 'Stores AI-generated proposals for prospects';
COMMENT ON COLUMN proposals.slug IS 'Unique URL-friendly identifier for public access';
COMMENT ON COLUMN proposals.status IS 'Proposal status: draft, sent, viewed, signed, paid';
COMMENT ON COLUMN proposals.services_included IS 'JSON array of selected services';
COMMENT ON COLUMN proposals.client_current_marketing IS 'JSON object of current marketing efforts';
COMMENT ON COLUMN proposals.signature_data IS 'JSON object containing signature information';
