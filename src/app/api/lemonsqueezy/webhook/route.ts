import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyFounder } from "@/lib/founder-notify";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function grantProByEmail(email: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const normalized = email.toLowerCase().trim();
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();

  if (!profile?.id) return;

  await admin
    .from("profiles")
    .update({
      is_pro: true,
      pro_since: new Date().toISOString(),
    })
    .eq("id", profile.id);
}

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const hmac = Buffer.from(
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex"),
    "hex"
  );
  const signature = Buffer.from(signatureHeader, "hex");

  if (hmac.length === 0 || signature.length === 0) return false;
  return crypto.timingSafeEqual(hmac, signature);
}

export async function POST(req: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("X-Signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    meta?: {
      event_name?: string;
      custom_data?: { plan?: string };
    };
    data?: {
      attributes?: {
        user_email?: string;
        customer_email?: string;
        status?: string;
        total?: number;
        currency?: string;
      };
    };
  };

  const event = payload.meta?.event_name ?? "";
  const email =
    payload.data?.attributes?.user_email ??
    payload.data?.attributes?.customer_email ??
    null;
  const plan = payload.meta?.custom_data?.plan ?? "unknown";

  try {
    if (
      event === "subscription_created" ||
      event === "order_created" ||
      event === "subscription_payment_success"
    ) {
      await notifyFounder({
        kind: "waitlist",
        summary: `Lemon Squeezy: ${event}`,
        fields: {
          email,
          plan,
          amount: payload.data?.attributes?.total ?? null,
          currency: payload.data?.attributes?.currency ?? "usd",
        },
      });

      if (plan === "pro" && email) {
        await grantProByEmail(email);
      }
    }

    if (event === "subscription_cancelled" || event === "subscription_expired") {
      await notifyFounder({
        kind: "waitlist",
        summary: `Lemon Squeezy subscription ended: ${event}`,
        fields: { email, plan },
      });
    }
  } catch (e) {
    console.error("Lemon webhook:", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
