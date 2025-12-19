const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function backupDonData() {
  console.log('🔍 Finding Don\'s user ID...');
  
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'don@truexpanse.com')
    .single();
  
  if (userError || !user) {
    console.error('Error finding Don:', userError);
    process.exit(1);
  }
  
  console.log(`✅ Found Don: ${user.id} (Company: ${user.company_id})`);
  
  const donUserId = user.id;
  const donCompanyId = user.company_id;
  
  // Backup clients
  console.log('📦 Backing up clients...');
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', donUserId);
  
  fs.writeFileSync('don_backup_clients.json', JSON.stringify(clients || [], null, 2));
  console.log(`✅ Backed up ${(clients || []).length} clients`);
  
  // Backup transactions
  console.log('📦 Backing up transactions...');
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', donUserId);
  
  fs.writeFileSync('don_backup_transactions.json', JSON.stringify(transactions || [], null, 2));
  console.log(`✅ Backed up ${(transactions || []).length} transactions`);
  
  // Backup day_data
  console.log('📦 Backing up day data...');
  const { data: dayData } = await supabase
    .from('day_data')
    .select('*')
    .eq('user_id', donUserId);
  
  fs.writeFileSync('don_backup_day_data.json', JSON.stringify(dayData || [], null, 2));
  console.log(`✅ Backed up ${(dayData || []).length} day records`);
  
  // Backup hot_leads
  console.log('📦 Backing up hot leads...');
  const { data: hotLeads } = await supabase
    .from('hot_leads')
    .select('*')
    .eq('user_id', donUserId);
  
  fs.writeFileSync('don_backup_hot_leads.json', JSON.stringify(hotLeads || [], null, 2));
  console.log(`✅ Backed up ${(hotLeads || []).length} hot leads`);
  
  // Backup events
  console.log('📦 Backing up events...');
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', donUserId);
  
  fs.writeFileSync('don_backup_events.json', JSON.stringify(events || [], null, 2));
  console.log(`✅ Backed up ${(events || []).length} events`);
  
  console.log('\n🎉 BACKUP COMPLETE!');
  console.log('📁 Files created:');
  console.log('  - don_backup_clients.json');
  console.log('  - don_backup_transactions.json');
  console.log('  - don_backup_day_data.json');
  console.log('  - don_backup_hot_leads.json');
  console.log('  - don_backup_events.json');
}

backupDonData().catch(console.error);
