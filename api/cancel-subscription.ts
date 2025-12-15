import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Email notification function
async function sendCancellationEmail(userEmail: string, userName: string, plan: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TrueXpanse <notifications@truexpanse.com>',
        to: ['don@truexpanse.com'],
        subject: '🚨 Subscription Cancelled - TrueXpanse MAT',
        html: `
          <h2>Subscription Cancelled</h2>
          <p><strong>User:</strong> ${userName} (${userEmail})</p>
          <p><strong>Plan:</strong> ${plan}</p>
          <p><strong>Cancelled at:</strong> ${new Date().toLocaleString()}</p>
          <p>The user will have access until the end of their billing period.</p>
        `,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send cancellation email:', await response.text());
    }
  } catch (error) {
    console.error('Error sending cancellation email:', error);
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { userId, subscriptionId } = JSON.parse(event.body || '{}');

    if (!userId || !subscriptionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId or subscriptionId' })
      };
    }

    // Get user and company data
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('email, name, company_id')
      .eq('id', userId)
      .single();

    if (!userData) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const { data: companyData } = await supabaseAdmin
      .from('companies')
      .select('plan')
      .eq('id', userData.company_id)
      .single();

    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    // Update company record
    await supabaseAdmin
      .from('companies')
      .update({
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userData.company_id);

    // Send cancellation notification email
    await sendCancellationEmail(
      userData.email,
      userData.name,
      companyData?.plan || 'Unknown'
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Subscription cancelled successfully',
        subscription 
      })
    };

  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
