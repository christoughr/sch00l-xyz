import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyFounder } from "@/lib/founder-notify";
import { setProStatus } from "@/lib/pro-gate";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

async function grantPro(opts: {
  userId?: string | null;
  email?: string | null;
  subscriptionId?: string;
  orderId?: string;
}): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  if (opts.userId) {
    await setProStatus(opts.userId, true, {
      lsSubscriptionId: opts.subscriptionId,
      lsOrderId: opts.orderId,
    });
    return;
  }

  const email = opts.email?.toLowerCase().trim();
  if (!email) return;

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (profile?.id) {
    await setProStatus(profile.id, true, {
      lsSubscriptionId: opts.subscriptionId,
      lsOrderId: opts.orderId,
    });
  }
}

async function revokePro(opts: {
  userId?: string | null;
  email?: string | null;
}): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  let userId = opts.userId;
  if (!userId && opts.email) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("email", opts.email.toLowerCase().trim())
      .maybeSingle();
    userId = data?.id;
  }
  if (userId) await setProStatus(userId, false);
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
      custom_data?: {
        plan?: string;
        user_id?: string;
      };
    };
    data?: {
      id?: string;
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
  const custom = payload.meta?.custom_data ?? {};
  const email =
    payload.data?.attributes?.user_email ??
    payload.data?.attributes?.customer_email ??
    null;
  const userId = custom.user_id ?? null;
  const plan = custom.plan ?? "unknown";
  const subscriptionId =
    event.startsWith("subscription") ? payload.data?.id ?? undefined : undefined;
  const orderId =
    event === "order_created" ? payload.data?.id ?? undefined : undefined;

  try {
    if (
      event === "subscription_created" ||
      event === "subscription_payment_success" ||
      (event === "order_created" && plan === "pro")
    ) {
      await notifyFounder({
        kind: "waitlist",
        summary: `Lemon Squeezy: ${event}`,
        fields: { email, plan, userId },
      });
      if (plan === "pro" || event.startsWith("subscription")) {
        await grantPro({ userId, email, subscriptionId, orderId });
      }
    }

    if (event === "subscription_cancelled" || event === "subscription_expired") {
      await notifyFounder({
        kind: "waitlist",
        summary: `Lemon Squeezy subscription ended: ${event}`,
        fields: { email, userId },
      });
      await revokePro({ userId, email });
    }
  } catch (e) {
    console.error("Lemon webhook:", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
