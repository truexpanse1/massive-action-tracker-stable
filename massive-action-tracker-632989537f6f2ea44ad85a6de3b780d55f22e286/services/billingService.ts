// services/billingService.ts
// (make sure this lives in the same folder as supabaseClient.ts)

export interface CheckoutSessionResponse {
  url: string;
}

/**
 * Start a Stripe Checkout session for the given price and email.
 * On success this will redirect the browser to the Stripe-hosted
 * checkout page returned by your /api/create-checkout-session route.
 */
export async function startStripeCheckout(
  priceId: string,
  email: string
): Promise<void> {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId, email }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('Checkout error:', response.status, text);
      throw new Error('Unable to start checkout. Please try again.');
    }

    const data = (await response.json()) as CheckoutSessionResponse;

    if (!data?.url) {
      console.error('Checkout response missing URL:', data);
      throw new Error('Checkout session did not return a URL.');
    }

    // Redirect the user to Stripe Checkout
    window.location.href = data.url;
  } catch (err) {
    console.error('Error starting Stripe checkout:', err);
    throw err;
  }
}
