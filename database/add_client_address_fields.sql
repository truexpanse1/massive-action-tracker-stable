-- Add city, state, and zip columns to clients table
-- Run this in Supabase SQL Editor

-- Add city column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'city'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN city TEXT;
  END IF;
END $$;

-- Add state column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'state'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN state TEXT;
  END IF;
END $$;

-- Add zip column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'zip'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN zip TEXT;
  END IF;
END $$;
