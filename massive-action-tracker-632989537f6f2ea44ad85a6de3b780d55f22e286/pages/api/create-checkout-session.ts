// pages/api/create-checkout-session.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ONLY ALLOW POST – this fixes the 405 error you were getting
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { priceId, email } = req.body;

    // Safety checks – will never happen from your frontend but good practice
    if (!email || !priceId) {
      return res.status(400).json({ error: 'Email and Price ID are required' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      subscription_data: {
        trial_period_days: 7,
        trial_settings: {
          end_behavior: { missing_payment_method: 'cancel' },
        },
      },
      success_url: `${req.headers.origin || 'https://apptruexpanse.com'}/trial-success`,
      cancel_url: `${req.headers.origin || 'https://apptruexpanse.com'}/#pricing`,
      metadata: {
        note: '7-day card-upfront trial',
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err.message);
    return res.status(500).json({ error: err.message || 'Something went wrong' });
  }
}
