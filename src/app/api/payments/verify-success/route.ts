import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ verified: false, reason: "missing_session" });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ verified: false, reason: "stripe_off" });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ verified: false, reason: "stripe_off" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid =
      session.payment_status === "paid" ||
      session.status === "complete";
    const plan = session.metadata?.plan;
    return NextResponse.json({
      verified: paid && (plan === "pro" || !plan),
      plan: plan ?? "pro",
    });
  } catch {
    return NextResponse.json({ verified: false, reason: "invalid_session" });
  }
}
