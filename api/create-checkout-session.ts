import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export const handler: Handler = async (event) => {
  // Quick health check (GET)
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        method: 'GET',
        message: 'Stripe checkout endpoint is alive',
      }),
    };
  }

  // Only allow POST for creating sessions
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { priceId, email, userData } = body;

    if (!priceId || !email) {
      console.error('DEBUG missing fields. Received body:', body);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing priceId or email in request body.' }),
      };
    }

    // ✅ Create or reuse customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    const existingCustomer = customers.data[0];

    const customer =
      existingCustomer ??
      (await stripe.customers.create({
        email,
      }));

    // ✅ Build success/cancel URLs
    const origin =
      event.headers.origin ||
      process.env.APP_BASE_URL ||
      'https://www.apptruexpanse.com';

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: userData ? {
        fullName: userData.fullName,
        company: userData.company,
        phone: userData.phone,
        password: userData.password,
        planName: userData.planName,
        email: email,
      } : { email },
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancelled`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session.' }),
    };
  }
};
