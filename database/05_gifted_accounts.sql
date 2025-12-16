-- Gifted Accounts System
-- Allows users to create and manage standalone accounts for others
-- Billing is handled externally (e.g., GoHighLevel)

-- Add gifted accounts tracking to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS sponsored_by_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_gifted_account BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gifted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'disabled'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_sponsored_by ON companies(sponsored_by_user_id);
CREATE INDEX IF NOT EXISTS idx_companies_is_gifted ON companies(is_gifted_account);
CREATE INDEX IF NOT EXISTS idx_companies_account_status ON companies(account_status);

-- Add comments
COMMENT ON COLUMN companies.sponsored_by_user_id IS 'User ID of the person who is paying for/sponsoring this account';
COMMENT ON COLUMN companies.is_gifted_account IS 'Whether this is a gifted/sponsored account (standalone, not a team member)';
COMMENT ON COLUMN companies.gifted_at IS 'Timestamp when this account was gifted';
COMMENT ON COLUMN companies.account_status IS 'Account status: active or disabled (for access control)';
