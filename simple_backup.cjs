// Simple backup - provide Supabase credentials as command line args
// Usage: node simple_backup.cjs <SUPABASE_URL> <SUPABASE_ANON_KEY>

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://yqtdqgxqhwwwqpjqrxvf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdGRxZ3hxaHd3d3FwanFyeHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NTM2OTEsImV4cCI6MjA0OTQyOTY5MX0.Ej7zP_Hx0rXGCMVnVzIQFXEEL2Uh9yGN1gTDvqJJNNI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function backup() {
  try {
    console.log('🔍 Finding Don...');
    
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'don@truexpanse.com')
      .single();
    
    if (!user) {
      console.log('❌ Don not found');
      return;
    }
    
    console.log(`✅ Found Don: ${user.id}`);
    
    const tables = [
      { name: 'clients', filter: 'user_id' },
      { name: 'transactions', filter: 'user_id' },
      { name: 'day_data', filter: 'user_id' },
      { name: 'hot_leads', filter: 'user_id' },
      { name: 'events', filter: 'user_id' }
    ];
    
    for (const table of tables) {
      console.log(`📦 Backing up ${table.name}...`);
      const { data } = await supabase
        .from(table.name)
        .select('*')
        .eq(table.filter, user.id);
      
      fs.writeFileSync(`don_backup_${table.name}.json`, JSON.stringify(data || [], null, 2));
      console.log(`✅ Backed up ${(data || []).length} ${table.name}`);
    }
    
    console.log('\n🎉 BACKUP COMPLETE!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

backup();
