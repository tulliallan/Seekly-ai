import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    const supabase = createRouteHandlerClient({ cookies });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;

        if (userId) {
          // Update subscription status
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_subscription_id: session.subscription as string,
              stripe_customer_id: session.customer as string,
              status: 'active',
              current_period_end: new Date(
                (session.subscription_data?.trial_end || Date.now() + 30 * 24 * 60 * 60) * 1000
              ),
            });

          // Update user credits
          await supabase
            .from('user_credits')
            .upsert({
              user_id: userId,
              is_premium: true,
              premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              credits_remaining: 500
            });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.user_id;

        if (userId) {
          if (subscription.status === 'active') {
            await supabase
              .from('user_credits')
              .update({
                is_premium: true,
                premium_until: new Date(subscription.current_period_end * 1000),
                credits_remaining: 500
              })
              .eq('user_id', userId);
          } else {
            await supabase
              .from('user_credits')
              .update({
                is_premium: false,
                premium_until: null
              })
              .eq('user_id', userId);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
} 