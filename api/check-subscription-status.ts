import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { subscriptionId } = JSON.parse(event.body || '{}');

    if (!subscriptionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing subscriptionId' })
      };
    }

    // Retrieve subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Check if subscription is active or in trial
    const isActive = ['active', 'trialing'].includes(subscription.status);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        isActive,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end
      })
    };

  } catch (error: any) {
    console.error('Error checking subscription status:', error);
    
    // If subscription not found in Stripe, consider it inactive
    if (error.code === 'resource_missing') {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          isActive: false,
          status: 'not_found'
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
