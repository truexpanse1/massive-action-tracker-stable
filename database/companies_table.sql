-- Create companies table for multi-tenancy
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL, -- 'Solo Closer', 'Team Engine', 'Elite / Company'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add company_id to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own company
CREATE POLICY "Users can view their own company"
  ON public.companies
  FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy: Only company owners can update their company
CREATE POLICY "Company owners can update their company"
  ON public.companies
  FOR UPDATE
  USING (owner_id = auth.uid());

-- Policy: Service role can insert companies (for webhook)
CREATE POLICY "Service role can insert companies"
  ON public.companies
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_stripe_customer ON public.companies(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
