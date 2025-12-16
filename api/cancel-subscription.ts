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

// Email notification function for cancellation requests
async function sendCancellationRequestEmail(userEmail: string, userName: string, plan: string, companyName: string, subscriptionId: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TrueXpanse MAT <notifications@truexpanse.com>',
        to: ['don@truexpanse.com'],
        subject: '🚨 Cancellation Request - TrueXpanse MAT',
        html: `
          <h2>Subscription Cancellation Request</h2>
          <p>A user has requested to cancel their subscription.</p>
          <hr>
          <p><strong>User:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Plan:</strong> ${plan}</p>
          <p><strong>Stripe Subscription ID:</strong> ${subscriptionId}</p>
          <p><strong>Requested at:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p><strong>Action Required:</strong> Please log into Stripe and cancel this subscription manually.</p>
          <p>Once cancelled in Stripe, the user's access will automatically expire at the end of their billing period.</p>
        `,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send cancellation request email:', await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error sending cancellation request email:', error);
    return false;
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
      .select('name, subscription_tier')
      .eq('id', userData.company_id)
      .single();

    // Send cancellation request email to Don
    const emailSent = await sendCancellationRequestEmail(
      userData.email,
      userData.name,
      companyData?.subscription_tier || 'Starter',
      companyData?.name || 'Unknown Company',
      subscriptionId
    );

    if (!emailSent) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send cancellation request email' })
      };
    }

    // Mark the cancellation request in the database
    await supabaseAdmin
      .from('companies')
      .update({
        cancellation_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userData.company_id);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Cancellation request sent successfully. You will receive confirmation once processed.'
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
