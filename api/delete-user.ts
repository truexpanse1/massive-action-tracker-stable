import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId } = JSON.parse(event.body || '{}');

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'userId is required' }),
      };
    }

    // 1. Delete user from auth.users (this will cascade delete related data due to foreign keys)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting user from auth:', authError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: authError.message }),
      };
    }

    // 2. Delete user from public.users table (if not already cascaded)
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (dbError) {
      console.error('Error deleting user from database:', dbError);
      // Don't fail the request if this errors - auth deletion is the critical part
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'User deleted successfully' }),
    };
  } catch (error: any) {
    console.error('Error in delete-user function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
