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
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { companyId, email, name, password } = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!companyId || !email || !name || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          required: ['companyId', 'email', 'name', 'password']
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    // Validate password length
    if (password.length < 6) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Password must be at least 6 characters' })
      };
    }

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email already exists' })
      };
    }

    // Verify company exists
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, max_users')
      .eq('id', companyId)
      .single();

    if (companyError || !companyData) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Company not found' })
      };
    }

    // Check if company has reached max users
    const { count: userCount } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId);

    if (userCount && userCount >= companyData.max_users) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: `Company has reached maximum users (${companyData.max_users})` 
        })
      };
    }

    console.log(`Creating team member: ${email} for company: ${companyId}`);

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
        body: JSON.stringify({ 
          error: 'Failed to create authentication user',
          details: authError.message 
        })
      };
    }

    const newUserId = authData.user.id;
    console.log(`Auth user created with ID: ${newUserId}`);

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
      console.log(`Rolling back - deleting auth user: ${newUserId}`);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to create user record',
          details: userError.message 
        })
      };
    }

    console.log(`Team member created successfully: ${email}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Team member created successfully',
        userId: newUserId,
        email,
        name
      })
    };

  } catch (error: any) {
    console.error('Unexpected error creating team member:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};
