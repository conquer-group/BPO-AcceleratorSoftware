import { NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";
import { createServiceClient } from "../../../lib/supabase/server";

// Stripe needs the raw body to verify the signature — Next.js route handlers give us that by default here.
export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  const supabase = createServiceClient();

  async function upsertFromSubscription(subscription, userId) {
    const status = subscription.status; // active, trialing, past_due, canceled, ...
    const item = subscription.items.data[0];
    const plan = item?.price?.id === process.env.STRIPE_PRICE_YEARLY ? "yearly" : "monthly";
    // Newer Stripe API versions moved current_period_end from the subscription itself onto each item.
    const periodEndSeconds = item?.current_period_end || subscription.current_period_end;
    await supabase.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      status,
      plan,
      current_period_end: periodEndSeconds ? new Date(periodEndSeconds * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.supabase_user_id;
        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await upsertFromSubscription(subscription, userId);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.supabase_user_id;
        if (userId) await upsertFromSubscription(subscription, userId);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.supabase_user_id;
        if (userId) {
          await supabase.from("subscriptions").upsert({
            user_id: userId,
            status: "canceled",
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
