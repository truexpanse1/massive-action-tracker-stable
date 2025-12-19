const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://yqtdqgxqhwwwqpjqrxvf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdGRxZ3hxaHd3d3FwanFyeHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NTM2OTEsImV4cCI6MjA0OTQyOTY5MX0.Ej7zP_Hx0rXGCMVnVzIQFXEEL2Uh9yGN1gTDvqJJNNI'
);

async function check() {
  // Get Don's info
  const { data: user } = await supabase
    .from('users')
    .select('id, email, company_id')
    .eq('email', 'don@truexpanse.com')
    .single();
  
  console.log('Don:', user);
  
  // Check GHL integrations
  const { data: integrations } = await supabase
    .from('ghl_integrations')
    .select('*');
  
  console.log('\nAll GHL Integrations:', JSON.stringify(integrations, null, 2));
  
  // Check for Don's company integration
  const { data: donIntegration } = await supabase
    .from('ghl_integrations')
    .select('*')
    .eq('company_id', user.company_id)
    .eq('is_active', true);
  
  console.log('\nDon\'s Company Integration:', JSON.stringify(donIntegration, null, 2));
}

check();
