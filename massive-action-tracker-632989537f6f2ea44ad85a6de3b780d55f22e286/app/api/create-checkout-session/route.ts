export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Simple GET so we can verify the route is wired
export async function GET() {
  return NextResponse.json({ status: 'ok-create-checkout-session-route' });
}

// MAIN POST HANDLER
export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();

    if (!priceId) {
      return new NextResponse('Missing priceId', { status: 400 });
    }

    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        trial_settings: {
          end_behavior: { missing_payment_method: 'cancel' },
        },
      },
      success_url: `${origin}/trial-success`,
      cancel_url: `${origin}/#pricing`,
      metadata: { note: '7-day card-upfront trial' },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return new NextResponse(
      error.message || 'Internal server error',
      { status: 500 }
    );
  }
}
