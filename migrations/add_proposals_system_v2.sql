-- Migration: Add Proposals System to MAT
-- Description: Adds service_packages and proposals tables with Dream Client Profile integration
-- Schema: hot_leads.id=BIGINT, all others=UUID

-- Create service_packages table
CREATE TABLE IF NOT EXISTS service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Package Details
    package_name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    industry TEXT,
    
    -- Pricing
    pricing_model TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    
    -- Services (JSON array)
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Metadata
    is_template BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Relationships (BIGINT for hot_leads, UUID for others)
    hot_lead_id BIGINT REFERENCES hot_leads(id) ON DELETE SET NULL,
    avatar_id UUID REFERENCES buyer_avatars(id) ON DELETE SET NULL,
    service_package_id UUID REFERENCES service_packages(id) ON DELETE SET NULL,
    
    -- Client Info
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    industry TEXT,
    
    -- AI-Generated Content
    ai_problem_analysis TEXT,
    ai_goals_content TEXT,
    ai_solution_narrative TEXT,
    
    -- Services & Pricing
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    pricing_model TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    
    -- URL & Sharing
    slug TEXT NOT NULL UNIQUE,
    
    -- Status & Tracking
    status TEXT DEFAULT 'draft',
    view_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    
    -- Acceptance Data
    acceptance_notes TEXT,
    acceptance_signature TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_packages_company ON service_packages(company_id);
CREATE INDEX IF NOT EXISTS idx_service_packages_user ON service_packages(user_id);
CREATE INDEX IF NOT EXISTS idx_service_packages_category ON service_packages(category);
CREATE INDEX IF NOT EXISTS idx_service_packages_active ON service_packages(is_active);

CREATE INDEX IF NOT EXISTS idx_proposals_company ON proposals(company_id);
CREATE INDEX IF NOT EXISTS idx_proposals_user ON proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_hot_lead ON proposals(hot_lead_id);
CREATE INDEX IF NOT EXISTS idx_proposals_avatar ON proposals(avatar_id);
CREATE INDEX IF NOT EXISTS idx_proposals_slug ON proposals(slug);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created ON proposals(created_at DESC);

-- Add proposal_count to hot_leads (safe - uses IF NOT EXISTS)
ALTER TABLE hot_leads 
ADD COLUMN IF NOT EXISTS proposal_count INTEGER DEFAULT 0;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_service_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS service_packages_updated_at ON service_packages;
CREATE TRIGGER service_packages_updated_at
BEFORE UPDATE ON service_packages
FOR EACH ROW
EXECUTE FUNCTION update_service_packages_updated_at();

CREATE OR REPLACE FUNCTION update_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS proposals_updated_at ON proposals;
CREATE TRIGGER proposals_updated_at
BEFORE UPDATE ON proposals
FOR EACH ROW
EXECUTE FUNCTION update_proposals_updated_at();

-- Trigger for hot_leads proposal_count
CREATE OR REPLACE FUNCTION update_hot_lead_proposal_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.hot_lead_id IS NOT NULL THEN
        UPDATE hot_leads 
        SET proposal_count = proposal_count + 1 
        WHERE id = NEW.hot_lead_id;
    ELSIF TG_OP = 'DELETE' AND OLD.hot_lead_id IS NOT NULL THEN
        UPDATE hot_leads 
        SET proposal_count = GREATEST(proposal_count - 1, 0) 
        WHERE id = OLD.hot_lead_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.hot_lead_id IS DISTINCT FROM NEW.hot_lead_id THEN
        IF OLD.hot_lead_id IS NOT NULL THEN
            UPDATE hot_leads 
            SET proposal_count = GREATEST(proposal_count - 1, 0) 
            WHERE id = OLD.hot_lead_id;
        END IF;
        IF NEW.hot_lead_id IS NOT NULL THEN
            UPDATE hot_leads 
            SET proposal_count = proposal_count + 1 
            WHERE id = NEW.hot_lead_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hot_lead_proposal_count_trigger ON proposals;
CREATE TRIGGER hot_lead_proposal_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON proposals
FOR EACH ROW
EXECUTE FUNCTION update_hot_lead_proposal_count();

-- Enable RLS
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_packages
DROP POLICY IF EXISTS "Users can view their company's service packages" ON service_packages;
CREATE POLICY "Users can view their company's service packages"
ON service_packages FOR SELECT
USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can create service packages" ON service_packages;
CREATE POLICY "Users can create service packages"
ON service_packages FOR INSERT
WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their company's service packages" ON service_packages;
CREATE POLICY "Users can update their company's service packages"
ON service_packages FOR UPDATE
USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their company's service packages" ON service_packages;
CREATE POLICY "Users can delete their company's service packages"
ON service_packages FOR DELETE
USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- RLS Policies for proposals
DROP POLICY IF EXISTS "Users can view their company's proposals" ON proposals;
CREATE POLICY "Users can view their company's proposals"
ON proposals FOR SELECT
USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Public can view proposals by slug" ON proposals;
CREATE POLICY "Public can view proposals by slug"
ON proposals FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can create proposals" ON proposals;
CREATE POLICY "Users can create proposals"
ON proposals FOR INSERT
WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their company's proposals" ON proposals;
CREATE POLICY "Users can update their company's proposals"
ON proposals FOR UPDATE
USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their company's proposals" ON proposals;
CREATE POLICY "Users can delete their company's proposals"
ON proposals FOR DELETE
USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

COMMENT ON TABLE service_packages IS 'Reusable service package templates with AI-enhanced descriptions';
COMMENT ON TABLE proposals IS 'AI-generated proposals linked to hot leads and dream client profiles';
