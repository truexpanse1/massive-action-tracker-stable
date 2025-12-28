import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kgpvqgvpzfqnkqxvxfqn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncHZxZ3ZwemZxbmtxeHZ4ZnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwNTQ3NzIsImV4cCI6MjA0OTYzMDc3Mn0.R7YTx-XZZaUWYfZxwFnKZJ0Yw9pXvRqSqZOJrEy_Cxo'
);

async function testTransactions() {
  console.log('Fetching transactions...');
  
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('company_id', 'b237eea8-7313-4a00-bc44-e3181c041c63')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\nFirst 5 transactions:');
  transactions.forEach((t, i) => {
    console.log(`\nTransaction ${i + 1}:`);
    console.log('  id:', t.id);
    console.log('  date:', t.date, '(type:', typeof t.date, ')');
    console.log('  user_id:', t.user_id);
    console.log('  client_name:', t.client_name);
    console.log('  amount:', t.amount);
  });

  // Test date filtering
  console.log('\n\nTesting date filtering...');
  const testDate = '2024-12-01';
  console.log('Looking for transactions on:', testDate);
  
  const filtered = transactions.filter(t => t.date === testDate);
  console.log('Found:', filtered.length, 'transactions');
  
  // Check users
  console.log('\n\nFetching users...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .eq('company_id', 'b237eea8-7313-4a00-bc44-e3181c041c63')
    .eq('role', 'Sales Rep')
    .eq('status', 'Active');

  if (usersError) {
    console.error('Error:', usersError);
    return;
  }

  console.log('\nSales Reps:');
  users.forEach(u => {
    console.log('  -', u.name, '(', u.id, ')');
  });
  
  // Now test if any transactions match any user
  console.log('\n\nChecking transaction-user matches...');
  const userIds = users.map(u => u.id);
  console.log('User IDs:', userIds);
  
  const { data: allTransactions, error: allError } = await supabase
    .from('transactions')
    .select('*')
    .eq('company_id', 'b237eea8-7313-4a00-bc44-e3181c041c63');
    
  if (allError) {
    console.error('Error:', allError);
    return;
  }
  
  console.log('\nTotal transactions:', allTransactions.length);
  
  userIds.forEach(userId => {
    const userTrans = allTransactions.filter(t => t.user_id === userId);
    const user = users.find(u => u.id === userId);
    console.log(`\n${user.name}: ${userTrans.length} transactions`);
    if (userTrans.length > 0) {
      console.log('  Sample dates:', userTrans.slice(0, 3).map(t => t.date));
      console.log('  Total revenue:', userTrans.reduce((sum, t) => sum + t.amount, 0));
    }
  });
}

testTransactions().catch(console.error);
