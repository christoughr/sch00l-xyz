import { discordBotConfigured } from "@/lib/discord-bot";
import { founderWebhookConfigured } from "@/lib/founder-notify";
import { isLemonSqueezyConfigured } from "@/lib/lemonsqueezy";
import { paymentConfig } from "@/lib/payments";
import { NextResponse } from "next/server";

export async function GET() {
  const payments = paymentConfig();
  return NextResponse.json({
    ok: true,
    service: "sch00l",
    time: new Date().toISOString(),
    supabase: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    lemonSqueezy: isLemonSqueezyConfigured(),
    payments: payments.provider,
    proCheckout: payments.proReady,
    founderWebhook: founderWebhookConfigured(),
    discordBot: discordBotConfigured(),
    ai: !!process.env.OPENAI_API_KEY,
  });
}
