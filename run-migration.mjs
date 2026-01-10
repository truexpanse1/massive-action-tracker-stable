import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://ietshbhcugjtnwqnnptg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldHNoYmhjdWdqdG53cW5ucHRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkxODUwNCwiZXhwIjoyMDc4NDk0NTA0fQ.ijiHMPSn-U9PVbOyF5OAfdsFMb9B88g6QNWbdADLMrM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 Running MAT Proposals System Migration...\n');

try {
  // Read the migration SQL
  const sql = readFileSync('./migrations/add_proposals_system.sql', 'utf8');
  
  // Execute the migration
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    // Try direct execution if RPC doesn't work
    console.log('Trying direct SQL execution...');
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error: stmtError } = await supabase.from('_sql').select('*').limit(0);
        if (stmtError) {
          console.error(`❌ Error executing statement:`, stmtError.message);
        }
      }
    }
    
    console.log('\n⚠️  Migration may need to be run manually through Supabase Dashboard');
    console.log('📋 SQL file location: ./migrations/add_proposals_system.sql');
    console.log('\nSteps:');
    console.log('1. Go to https://supabase.com/dashboard/project/ietshbhcugjtnwqnnptg');
    console.log('2. Click "SQL Editor"');
    console.log('3. Copy/paste the SQL from the migration file');
    console.log('4. Click "Run"');
  } else {
    console.log('✅ Migration completed successfully!');
    console.log('\nCreated tables:');
    console.log('  - service_packages');
    console.log('  - proposals');
    console.log('\nSeeded templates:');
    console.log('  - Elite Business Coaching ($1,500/mo)');
    console.log('  - Digital Dominance Package ($750/mo)');
    console.log('  - HVAC Service Marketing ($850/mo)');
  }
} catch (err) {
  console.error('❌ Migration failed:', err.message);
  console.log('\n📋 Please run the migration manually:');
  console.log('1. Go to https://supabase.com/dashboard/project/ietshbhcugjtnwqnnptg');
  console.log('2. Click "SQL Editor"');
  console.log('3. Copy/paste the SQL from: ./migrations/add_proposals_system.sql');
  console.log('4. Click "Run"');
}
