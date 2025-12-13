import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { userId } = JSON.parse(event.body || '{}');

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'userId is required' })
      };
    }

    // Delete from users table first
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (dbError) {
      console.error('Database delete error:', dbError);
      throw new Error(`Failed to delete from users table: ${dbError.message}`);
    }

    // Delete from auth.users using admin API
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Auth delete error:', authError);
      throw new Error(`Failed to delete from auth: ${authError.message}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'User deleted successfully from both database and auth' 
      })
    };

  } catch (error: any) {
    console.error('Delete user error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Failed to delete user' 
      })
    };
  }
};
