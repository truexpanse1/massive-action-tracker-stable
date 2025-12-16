import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { companyId, email, name, password } = JSON.parse(event.body || '{}');

    if (!companyId || !email || !name || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: authError.message })
      };
    }

    const newUserId = authData.user.id;

    // Create the user record
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newUserId,
        email,
        name,
        role: 'Sales Rep',
        company_id: companyId,
        status: 'active',
      });

    if (userError) {
      console.error('Error creating user record:', userError);
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: userError.message })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Team member created successfully',
        userId: newUserId,
      })
    };

  } catch (error: any) {
    console.error('Error creating team member:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
