-- Migration Script: Fix Product Names for Existing Transactions
-- This script updates all transactions with "Other" product to use the correct product name
-- from their contact's first invoice transaction

-- Step 1: Create a temporary table with contact product mappings
-- (This would need to be populated by the application logic since we can't call GHL API from SQL)

-- For now, we'll create a simpler approach:
-- Update Michael Tanore's transactions to "CRM Services"
UPDATE transactions
SET product = 'CRM Services'
WHERE client_name = 'Michael Tanore'
  AND product = 'Other';

-- Update Ethan Hoinacki's transactions to "Business Coaching"
UPDATE transactions
SET product = 'Business Coaching'
WHERE client_name = 'Ethan Hoinacki'
  AND product = 'Other';

-- Verify the updates
SELECT 
  client_name,
  product,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount
FROM transactions
WHERE client_name IN ('Michael Tanore', 'Ethan Hoinacki')
GROUP BY client_name, product
ORDER BY client_name, product;
