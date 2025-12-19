-- Add GHL transaction tracking to prevent duplicates
-- Migration: 08_add_ghl_transaction_tracking.sql

-- Add ghl_transaction_id column to transactions table for duplicate detection
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS ghl_transaction_id TEXT UNIQUE;

-- Add index for faster duplicate lookups
CREATE INDEX IF NOT EXISTS idx_transactions_ghl_transaction_id 
ON transactions(ghl_transaction_id) 
WHERE ghl_transaction_id IS NOT NULL;

-- Add last_ghl_sync timestamp to ghl_integrations table
ALTER TABLE ghl_integrations
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN transactions.ghl_transaction_id IS 'GHL transaction ID for duplicate detection during imports';
COMMENT ON COLUMN ghl_integrations.last_sync_at IS 'Timestamp of last successful GHL transaction sync';
