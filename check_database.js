import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('\n=== CHECKING DATABASE ===\n');
  
  // Check avatars
  const { data: avatars, error: avatarsError } = await supabase
    .from('buyer_avatars')
    .select('*');
  
  console.log('AVATARS:');
  console.log('Count:', avatars?.length || 0);
  if (avatarsError) console.error('Error:', avatarsError);
  if (avatars && avatars.length > 0) {
    console.log('Sample:', JSON.stringify(avatars[0], null, 2));
  }
  
  // Check content
  const { data: content, error: contentError } = await supabase
    .from('generated_content')
    .select('*');
  
  console.log('\nGENERATED CONTENT:');
  console.log('Count:', content?.length || 0);
  if (contentError) console.error('Error:', contentError);
  if (content && content.length > 0) {
    console.log('Sample:', JSON.stringify(content[0], null, 2));
    const postedCount = content.filter(c => c.used === true).length;
    console.log('Posted (used=true):', postedCount);
  }
}

checkDatabase();
