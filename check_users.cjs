const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://yqtdqgxqhwwwqpjqrxvf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdGRxZ3hxaHd3d3FwanFyeHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NTM2OTEsImV4cCI6MjA0OTQyOTY5MX0.Ej7zP_Hx0rXGCMVnVzIQFXEEL2Uh9yGN1gTDvqJJNNI'
);

async function checkUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('email, name, role')
    .ilike('email', '%truexpanse%');
  
  console.log('Users with truexpanse:', JSON.stringify(data, null, 2));
  console.log('Error:', error);
}

checkUsers();
