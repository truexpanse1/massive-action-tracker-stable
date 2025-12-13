import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const sig = event.headers['stripe-signature'];

  if (!sig) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No signature' })
    };
  }

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body!,
      sig,
      endpointSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
    };
  }

  // Handle the checkout.session.completed event
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object as Stripe.Checkout.Session;

    try {
      // Get user data from metadata
      const metadata = session.metadata;
      
      if (!metadata || !metadata.email || !metadata.password) {
        console.error('Missing metadata in checkout session:', session.id);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing user data in session' })
        };
      }

      const { email, password, fullName, company, phone, planName } = metadata;

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // Require email confirmation
        user_metadata: {
          full_name: fullName,
          company_name: company || fullName,
          phone: phone || '',
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        throw authError;
      }

      const userId = authData.user.id;

      // Create company record
      const companyName = company || fullName;
      const { data: companyData, error: companyError } = await supabaseAdmin
        .from('companies')
        .insert({
          name: companyName,
          owner_id: userId,
          plan: planName,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .select()
        .single();

      if (companyError) {
        console.error('Error creating company:', companyError);
        // If company creation fails, delete the auth user
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw companyError;
      }

      // Create user record in public.users table
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email,
          name: fullName,
          company_id: companyData.id,
          role: 'Manager', // First user is always the manager/owner
          status: 'Active',
        });

      if (userError) {
        console.error('Error creating user record:', userError);
        // Clean up: delete company and auth user
        await supabaseAdmin.from('companies').delete().eq('id', companyData.id);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw userError;
      }

      console.log(`Successfully created user ${email} with company ${companyName}`);

      return {
        statusCode: 200,
        body: JSON.stringify({ received: true, userId, companyId: companyData.id })
      };

    } catch (error: any) {
      console.error('Error processing webhook:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  // Return 200 for other event types
  return {
    statusCode: 200,
    body: JSON.stringify({ received: true })
  };
};
