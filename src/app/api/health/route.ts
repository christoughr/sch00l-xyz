import { founderWebhookConfigured } from "@/lib/founder-notify";
import { isStripeConfigured } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "sch00l",
    time: new Date().toISOString(),
    supabase: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    stripe: isStripeConfigured(),
    founderWebhook: founderWebhookConfigured(),
    ai: !!process.env.OPENAI_API_KEY,
  });
}
