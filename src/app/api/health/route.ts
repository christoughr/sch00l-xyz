import { discordBotConfigured } from "@/lib/discord-bot";
import { founderWebhookConfigured } from "@/lib/founder-notify";
import { isLemonSqueezyConfigured } from "@/lib/lemonsqueezy";
import { paymentConfig } from "@/lib/payments";
import { NextResponse } from "next/server";

export async function GET() {
  const payments = paymentConfig();
  const hasAiKey = !!process.env.OPENAI_API_KEY;
  const aiMode = hasAiKey ? "live" : "demo";

  const checks = {
    supabase: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    lemonSqueezy: isLemonSqueezyConfigured(),
    payments: payments.provider,
    proCheckout: payments.proReady,
    founderWebhook: founderWebhookConfigured(),
    discordBot: discordBotConfigured(),
    ai: hasAiKey,
    aiMode,
  };

  return NextResponse.json({
    ok: true,
    service: "sch00l",
    version: process.env.npm_package_version ?? "0.1.0",
    time: new Date().toISOString(),
    ...checks,
  });
}
