-- Migration: Add Proposals System to MAT
-- Description: Adds service_packages and proposals tables with Dream Client Profile integration

-- Create service_packages table
CREATE TABLE IF NOT EXISTS service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Package Details
    package_name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'coaching', 'marketing', 'hvac', 'real-estate', etc.
    industry TEXT,
    
    -- Pricing
    pricing_model TEXT NOT NULL, -- 'monthly', 'one-time', 'annual'
    price DECIMAL(10, 2) NOT NULL,
    
    -- Services (JSON array of service items)
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Example: [{"name": "Weekly Social Posts", "description": "4 posts per month", "ai_description": "..."}]
    
    -- Metadata
    is_template BOOLEAN DEFAULT false, -- Pre-built templates vs user-created
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Relationships
    hot_lead_id UUID REFERENCES hot_leads(id) ON DELETE SET NULL,
    avatar_id UUID REFERENCES buyer_avatars(id) ON DELETE SET NULL,
    service_package_id UUID REFERENCES service_packages(id) ON DELETE SET NULL,
    
    -- Client Info
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    industry TEXT,
    
    -- Proposal Content (AI-Generated)
    ai_problem_analysis TEXT, -- Generated from avatar pain_points + fears
    ai_goals_content TEXT, -- Generated from avatar goals + dreams + desires
    ai_solution_narrative TEXT, -- Generated addressing objections + buying_triggers
    
    -- Services & Pricing
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    pricing_model TEXT NOT NULL, -- 'monthly', 'one-time', 'annual'
    price DECIMAL(10, 2) NOT NULL,
    
    -- URL & Sharing
    slug TEXT NOT NULL UNIQUE, -- For public URL: /proposal/:slug
    
    -- Status & Tracking
    status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'viewed', 'accepted', 'rejected'
    view_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Acceptance Data
    acceptance_notes TEXT,
    acceptance_signature TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_service_packages_company ON service_packages(company_id);
CREATE INDEX idx_service_packages_user ON service_packages(user_id);
CREATE INDEX idx_service_packages_category ON service_packages(category);
CREATE INDEX idx_service_packages_active ON service_packages(is_active);

CREATE INDEX idx_proposals_company ON proposals(company_id);
CREATE INDEX idx_proposals_user ON proposals(user_id);
CREATE INDEX idx_proposals_hot_lead ON proposals(hot_lead_id);
CREATE INDEX idx_proposals_avatar ON proposals(avatar_id);
CREATE INDEX idx_proposals_slug ON proposals(slug);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created ON proposals(created_at DESC);

-- Add proposal_count to hot_leads table
ALTER TABLE hot_leads 
ADD COLUMN IF NOT EXISTS proposal_count INTEGER DEFAULT 0;

-- Create updated_at trigger for service_packages
CREATE OR REPLACE FUNCTION update_service_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_packages_updated_at
BEFORE UPDATE ON service_packages
FOR EACH ROW
EXECUTE FUNCTION update_service_packages_updated_at();

-- Create updated_at trigger for proposals
CREATE OR REPLACE FUNCTION update_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proposals_updated_at
BEFORE UPDATE ON proposals
FOR EACH ROW
EXECUTE FUNCTION update_proposals_updated_at();

-- Create trigger to update hot_leads proposal_count
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
    ELSIF TG_OP = 'UPDATE' AND OLD.hot_lead_id != NEW.hot_lead_id THEN
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
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hot_lead_proposal_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON proposals
FOR EACH ROW
EXECUTE FUNCTION update_hot_lead_proposal_count();

-- Enable Row Level Security
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_packages
CREATE POLICY "Users can view their company's service packages"
ON service_packages FOR SELECT
USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "Users can create service packages"
ON service_packages FOR INSERT
WITH CHECK (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "Users can update their company's service packages"
ON service_packages FOR UPDATE
USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "Users can delete their company's service packages"
ON service_packages FOR DELETE
USING (company_id = current_setting('app.current_company_id')::UUID);

-- RLS Policies for proposals
CREATE POLICY "Users can view their company's proposals"
ON proposals FOR SELECT
USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "Users can create proposals"
ON proposals FOR INSERT
WITH CHECK (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "Users can update their company's proposals"
ON proposals FOR UPDATE
USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "Users can delete their company's proposals"
ON proposals FOR DELETE
USING (company_id = current_setting('app.current_company_id')::UUID);

-- Insert pre-built service package templates
INSERT INTO service_packages (
    company_id, 
    user_id, 
    package_name, 
    description, 
    category, 
    industry,
    pricing_model, 
    price, 
    services,
    is_template
) VALUES
-- Elite Business Coaching
('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 
'Elite Business Coaching', 
'Transform your business with personalized coaching and strategic guidance',
'coaching', 'Business Coaching',
'monthly', 1500.00,
'[
    {"name": "4 Weekly 1-on-1 Coaching Calls", "description": "60-minute deep-dive sessions"},
    {"name": "Unlimited Email Support", "description": "Get answers when you need them"},
    {"name": "Custom Action Plan Development", "description": "Tailored strategy for your business"},
    {"name": "Quarterly Business Review", "description": "Track progress and adjust course"},
    {"name": "Access to Private Coaching Portal", "description": "Resources, templates, and tools"}
]'::jsonb,
true),

-- Digital Dominance Package
('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000',
'Digital Dominance Package',
'Complete done-for-you digital marketing to dominate your local market',
'marketing', 'Digital Marketing',
'monthly', 750.00,
'[
    {"name": "4 Weekly Social Media Posts", "description": "Professional content across all platforms"},
    {"name": "4 Weekly Email Campaigns", "description": "Nurture leads and drive conversions"},
    {"name": "1 Monthly Newsletter", "description": "Position yourself as the industry authority"},
    {"name": "Performance Analytics Dashboard", "description": "Track ROI in real-time"},
    {"name": "MAT Transparency Portal", "description": "See exactly what we do, when we do it"}
]'::jsonb,
true),

-- HVAC Service Marketing
('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000',
'HVAC Service Marketing',
'Year-round lead generation for heating and cooling companies',
'marketing', 'HVAC',
'monthly', 850.00,
'[
    {"name": "Google Maps Optimization", "description": "Dominate local search results"},
    {"name": "Seasonal Campaign Management", "description": "Targeted ads for peak seasons"},
    {"name": "Review Generation System", "description": "Build 5-star reputation automatically"},
    {"name": "Emergency Service Promotion", "description": "Capture urgent service calls"},
    {"name": "Monthly Performance Report", "description": "Track leads, calls, and bookings"}
]'::jsonb,
true);

COMMENT ON TABLE service_packages IS 'Reusable service package templates with AI-enhanced descriptions';
COMMENT ON TABLE proposals IS 'AI-generated proposals linked to hot leads and dream client profiles';
