-- Target Forwarding Feature
-- Tracks when targets are moved forward to the next day

-- Add columns to targets table
ALTER TABLE targets 
ADD COLUMN IF NOT EXISTS forwarded_from_date DATE,
ADD COLUMN IF NOT EXISTS forward_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_forwarded_at TIMESTAMPTZ;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_targets_forwarded_from ON targets(forwarded_from_date);
CREATE INDEX IF NOT EXISTS idx_targets_forward_count ON targets(forward_count);

-- Add comments
COMMENT ON COLUMN targets.forwarded_from_date IS 'The original date this target was moved from (if forwarded)';
COMMENT ON COLUMN targets.forward_count IS 'Number of times this target has been moved forward';
COMMENT ON COLUMN targets.last_forwarded_at IS 'Timestamp when this target was last moved forward';
