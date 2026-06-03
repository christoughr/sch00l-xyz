import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function grantProByEmail(
  email: string,
  customerId: string | null
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!profile?.id) return;

  await admin
    .from("profiles")
    .update({
      is_pro: true,
      pro_since: new Date().toISOString(),
      ...(customerId ? { stripe_customer_id: customerId } : {}),
    })
    .eq("id", profile.id);
}

async function revokeProByCustomerId(customerId: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("profiles")
    .update({ is_pro: false })
    .eq("stripe_customer_id", customerId);
}

async function recordPayment(
  session: Stripe.Checkout.Session,
  plan: string
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const amount = session.amount_total ?? 0;
  await admin.from("payments").upsert(
    {
      stripe_session_id: session.id,
      email: session.customer_details?.email ?? session.customer_email ?? null,
      plan,
      amount_cents: amount,
      currency: session.currency ?? "usd",
      status: "completed",
    },
    { onConflict: "stripe_session_id" }
  );
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("Stripe webhook signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const plan = session.metadata?.plan ?? "unknown";
        await recordPayment(session, plan);

        const email =
          session.customer_details?.email ?? session.customer_email ?? null;
        const customerId =
          typeof session.customer === "string" ? session.customer : null;

        if (plan === "pro" && email) {
          await grantProByEmail(email, customerId);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : null;
        if (customerId) await revokeProByCustomerId(customerId);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
