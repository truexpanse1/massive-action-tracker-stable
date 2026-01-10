import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://ietshbhcugjtnwqnnptg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldHNoYmhjdWdqdG53cW5ucHRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkxODUwNCwiZXhwIjoyMDc4NDk0NTA0fQ.ijiHMPSn-U9PVbOyF5OAfdsFMb9B88g6QNWbdADLMrM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running proposals table migration...');
  
  const migrationSQL = fs.readFileSync('./proposals_migration.sql', 'utf8');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      
      // Try alternative approach - create table directly
      console.log('Trying direct table creation...');
      await createProposalsTableDirectly();
    } else {
      console.log('✅ Migration completed successfully!');
      console.log(data);
    }
  } catch (err) {
    console.error('❌ Error running migration:', err);
    console.log('Trying direct table creation...');
    await createProposalsTableDirectly();
  }
}

async function createProposalsTableDirectly() {
  // We'll create the table by inserting a test record which will fail,
  // but first let's check if we can query the database
  const { data, error } = await supabase
    .from('proposals')
    .select('count')
    .limit(1);
  
  if (error && error.message.includes('does not exist')) {
    console.log('❌ Proposals table does not exist.');
    console.log('📝 Please run the migration SQL manually in Supabase Dashboard:');
    console.log('   1. Go to https://supabase.com/dashboard/project/ietshbhcugjtnwqnnptg/editor');
    console.log('   2. Click "SQL Editor"');
    console.log('   3. Paste the contents of proposals_migration.sql');
    console.log('   4. Click "Run"');
  } else if (!error) {
    console.log('✅ Proposals table already exists!');
  } else {
    console.log('Error checking table:', error);
  }
}

runMigration();
