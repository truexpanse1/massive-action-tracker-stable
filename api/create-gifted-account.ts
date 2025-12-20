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
    const { sponsorUserId, email, name, companyName, password, billingType, plan } = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!sponsorUserId || !email || !name || !companyName || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          required: ['sponsorUserId', 'email', 'name', 'companyName', 'password']
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

    // Determine max_users based on plan
    const maxUsers = plan === 'solo' ? 1 : plan === 'team' ? 5 : 10;
    const subscriptionTier = billingType === 'ghl' ? 'gifted' : plan;

    console.log(`Creating gifted account: ${email}, billing: ${billingType}, plan: ${plan}`);

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

    // Create the company
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: companyName,
        max_users: maxUsers,
        subscription_tier: subscriptionTier,
        sponsored_by_user_id: billingType === 'ghl' ? sponsorUserId : null,
        is_gifted_account: billingType === 'ghl',
        gifted_at: billingType === 'ghl' ? new Date().toISOString() : null,
        account_status: 'active',
      })
      .select()
      .single();

    if (companyError) {
      console.error('Error creating company:', companyError);
      
      // Rollback: delete the auth user
      console.log(`Rolling back - deleting auth user: ${newUserId}`);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to create company',
          details: companyError.message 
        })
      };
    }

    console.log(`Company created with ID: ${companyData.id}`);

    // Create or update the user record (upsert in case trigger already created it)
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: newUserId,
        email,
        name,
        role: 'Admin', // Gifted account owner is admin of their own company
        company_id: companyData.id,
        status: 'active',
      }, {
        onConflict: 'id'
      });

    if (userError) {
      console.error('Error creating user record:', userError);
      
      // Rollback: delete company and auth user
      console.log(`Rolling back - deleting company: ${companyData.id}`);
      await supabaseAdmin.from('companies').delete().eq('id', companyData.id);
      
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

    console.log(`Gifted account created successfully: ${email}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Gifted account created successfully',
        userId: newUserId,
        companyId: companyData.id,
        email,
        name,
        companyName
      })
    };

  } catch (error: any) {
    console.error('Unexpected error creating gifted account:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};
