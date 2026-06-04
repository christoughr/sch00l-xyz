import { isLiveAiConfigured } from "@/lib/ai-config";
import { discordBotConfigured } from "@/lib/discord-bot";
import { founderWebhookConfigured } from "@/lib/founder-notify";
import { isLemonSqueezyConfigured } from "@/lib/lemonsqueezy";
import { paymentConfig } from "@/lib/payments";
import { isResendConfigured } from "@/lib/resend";
import { NextResponse } from "next/server";

export async function GET() {
  const payments = paymentConfig();
  const aiMode = isLiveAiConfigured() ? "live" : "demo";

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
    ai: isLiveAiConfigured(),
    aiMode,
    aiKeySource: process.env.OPENAI_API_KEY
      ? "OPENAI_API_KEY"
      : process.env.GROQ_API_KEY
        ? "GROQ_API_KEY"
        : "none",
    resend: isResendConfigured(),
  };

  return NextResponse.json({
    ok: true,
    service: "sch00l",
    version: process.env.npm_package_version ?? "0.1.0",
    time: new Date().toISOString(),
    ...checks,
  });
}
