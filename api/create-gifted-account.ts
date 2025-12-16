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
    const { sponsorUserId, email, name, companyName, password, billingType, plan } = JSON.parse(event.body || '{}');

    if (!sponsorUserId || !email || !name || !companyName || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Determine max_users based on plan
    const maxUsers = plan === 'solo' ? 1 : plan === 'team' ? 5 : 10;
    const subscriptionType = billingType === 'ghl' ? 'gifted' : plan;

    // Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
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

    // Create the company
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: companyName,
        max_users: maxUsers,
        subscription_: subscriptionType,
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
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: companyError.message })
      };
    }

    // Create the user record
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newUserId,
        email,
        name,
        role: 'Sales Rep',
        company_id: companyData.id,
        status: 'active',
      });

    if (userError) {
      console.error('Error creating user record:', userError);
      // Rollback: delete company and auth user
      await supabaseAdmin.from('companies').delete().eq('id', companyData.id);
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
        message: 'Gifted account created successfully',
        userId: newUserId,
        companyId: companyData.id,
      })
    };

  } catch (error: any) {
    console.error('Error creating gifted account:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
