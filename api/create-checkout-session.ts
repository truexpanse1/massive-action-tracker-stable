// api/create-checkout-session.ts (or .js)

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: any, res: any) {
  // Quick health check (GET)
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      method: 'GET',
      message: 'Stripe checkout endpoint is alive',
    });
  }

  // Only allow POST for creating sessions
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 🔹 Handle both cases: body as object OR as raw JSON string
    let body: any = req.body;

    if (!body) {
      // Some runtimes don’t parse JSON automatically
      let raw = '';
      await new Promise<void>((resolve, reject) => {
        req.on('data', (chunk: any) => {
          raw += chunk;
        });
        req.on('end', () => resolve());
        req.on('error', (err: any) => reject(err));
      });

      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch {
          body = {};
        }
      }
    } else if (typeof body === 'string') {
      // If it’s a JSON string, parse it
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { priceId, email, userData } = body || {};

    if (!priceId || !email) {
      console.error('DEBUG missing fields. Received body:', body);
      return res
        .status(400)
        .json({ error: 'Missing priceId or email in request body.' });
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
      (req.headers.origin as string) ||
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

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return res
      .status(500)
      .json({ error: 'Failed to create checkout session.' });
  }
}
