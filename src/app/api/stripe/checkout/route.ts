import { PRICING } from "@/lib/pricing";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";
import { getStripe, isStripeConfigured, stripePriceIds } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["pro", "tutor_hour"]),
  email: z.string().email().optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limited = rateLimit(`stripe-checkout:${ip}`, {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error: "Payments not configured yet",
        fallbackUrl: "/#waitlist",
      },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe unavailable" }, { status: 503 });
  }

  const prices = stripePriceIds();
  const { plan, email } = parsed.data;

  if (plan === "pro" && !prices.proMonthly) {
    return NextResponse.json(
      { error: "Pro price not configured", fallbackUrl: "/#waitlist" },
      { status: 503 }
    );
  }
  if (plan === "tutor_hour" && !prices.tutorHour) {
    return NextResponse.json(
      { error: "Tutor price not configured", fallbackUrl: "/tutors" },
      { status: 503 }
    );
  }

  const base = SITE_URL.replace(/\/$/, "");
  const isPro = plan === "pro";

  const session = await stripe.checkout.sessions.create({
    mode: isPro ? "subscription" : "payment",
    customer_email: email,
    line_items: [
      {
        price: isPro ? prices.proMonthly : prices.tutorHour,
        quantity: 1,
      },
    ],
    success_url: isPro
      ? `${base}/pro/success?session_id={CHECKOUT_SESSION_ID}`
      : `${base}/tutors?paid=1`,
    cancel_url: `${base}/pricing`,
    metadata: {
      plan,
      product: isPro ? PRICING.pro.name : PRICING.humanTutor.name,
    },
    ...(isPro
      ? {
          subscription_data: {
            metadata: { plan: "pro" },
          },
        }
      : {}),
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
