# Database Migration 04 - Add Cancellation Tracking

## Instructions

Run this SQL in your Supabase SQL Editor:

```sql
-- Add cancellation tracking column to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN companies.cancellation_requested_at IS 'Timestamp when user requested subscription cancellation';
```

## Purpose

This migration adds a `cancellation_requested_at` column to track when users request subscription cancellations. This helps you manage cancellation requests and know when they were submitted.

## What This Enables

- Tracks cancellation request timestamps
- Allows you to see pending cancellation requests
- Helps manage the cancellation workflow

## How to Run

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL above
4. Click "Run"

That's it!
