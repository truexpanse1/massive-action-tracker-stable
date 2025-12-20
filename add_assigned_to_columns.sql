-- Migration: Add assigned_to columns for role-based access control
-- Purpose: Enable sales reps to only see their own data

-- Add assigned_to column to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);

-- Add assigned_to column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);

-- Add assigned_to column to hot_leads table
ALTER TABLE hot_leads 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);

-- Add assigned_to column to prospecting_contacts table
ALTER TABLE prospecting_contacts 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_assigned_to ON clients(assigned_to);
CREATE INDEX IF NOT EXISTS idx_transactions_assigned_to ON transactions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_hot_leads_assigned_to ON hot_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_prospecting_contacts_assigned_to ON prospecting_contacts(assigned_to);

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_clients_company_assigned ON clients(company_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_transactions_company_assigned ON transactions(company_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_hot_leads_company_assigned ON hot_leads(company_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_prospecting_contacts_company_assigned ON prospecting_contacts(company_id, assigned_to);

-- Verify the changes
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'assigned_to'
  AND table_name IN ('clients', 'transactions', 'hot_leads', 'prospecting_contacts')
ORDER BY table_name;
