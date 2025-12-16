-- Add cancellation tracking column to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN companies.cancellation_requested_at IS 'Timestamp when user requested subscription cancellation';
