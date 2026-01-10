-- Proposals Table for MAT
-- Stores AI-powered proposal data

CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Unique slug for public URL
  slug VARCHAR(255) NOT NULL UNIQUE,
  
  -- Your business info
  your_company_name VARCHAR(255) NOT NULL,
  your_contact VARCHAR(255),
  your_email VARCHAR(255),
  your_phone VARCHAR(100),
  your_website TEXT,
  your_logo_url TEXT,
  
  -- Client info
  client_company_name VARCHAR(255) NOT NULL,
  client_contact_name VARCHAR(255),
  client_industry VARCHAR(100),
  client_location VARCHAR(255),
  client_website TEXT,
  client_logo_url TEXT,
  
  -- Research & Discovery
  client_problems TEXT,
  client_goals TEXT,
  client_competitive_landscape TEXT,
  
  -- AI-generated content
  ai_problem_analysis TEXT,
  ai_solution_narrative TEXT,
  ai_goals_content TEXT,
  
  -- Offer details
  service_name VARCHAR(255),
  monthly_investment VARCHAR(50),
  one_time_investment VARCHAR(50),
  annual_investment VARCHAR(50),
  services_included JSONB,
  
  -- CTA & Next Steps
  cta_button_text VARCHAR(255) DEFAULT 'Accept This Proposal',
  next_steps TEXT,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'draft',
  views_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  
  -- Acceptance data
  signed_at TIMESTAMPTZ,
  signature_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_company_id ON proposals(company_id);
CREATE INDEX IF NOT EXISTS idx_proposals_slug ON proposals(slug);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC);

-- RLS Policies
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Users can view their own proposals
CREATE POLICY "Users can view own proposals"
  ON proposals FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own proposals
CREATE POLICY "Users can insert own proposals"
  ON proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own proposals
CREATE POLICY "Users can update own proposals"
  ON proposals FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own proposals
CREATE POLICY "Users can delete own proposals"
  ON proposals FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view proposals by slug (for client viewing)
CREATE POLICY "Anyone can view proposals by slug"
  ON proposals FOR SELECT
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_proposals_updated_at();

-- Comments
COMMENT ON TABLE proposals IS 'AI-powered proposals for closing deals';
COMMENT ON COLUMN proposals.slug IS 'Unique URL-safe identifier for public access';
COMMENT ON COLUMN proposals.ai_problem_analysis IS 'AI-generated analysis of client problems';
COMMENT ON COLUMN proposals.ai_solution_narrative IS 'AI-generated solution description';
COMMENT ON COLUMN proposals.ai_goals_content IS 'AI-generated goals and outcomes content';
COMMENT ON COLUMN proposals.services_included IS 'JSON array of service objects with name, quantity, description';
COMMENT ON COLUMN proposals.signature_data IS 'JSON object with name, email, phone from acceptance';
