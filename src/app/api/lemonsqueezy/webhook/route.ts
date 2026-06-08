import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantEntitlement, revokeEntitlementsBySubscription } from "@/lib/entitlements";
import { notifyFounder } from "@/lib/founder-notify";
import { lemonVariantMeta } from "@/lib/lemonsqueezy";
import { setProStatus } from "@/lib/pro-gate";
import type { SellableCurriculumId } from "@/lib/pricing";
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

async function resolveUserId(
  userId?: string | null,
  email?: string | null
): Promise<string | null> {
  if (userId) return userId;
  const admin = createAdminClient();
  if (!admin || !email) return null;
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  return data?.id ?? null;
}

async function grantFromCheckout(opts: {
  userId: string;
  plan: string;
  subscriptionId?: string;
  variantId?: string;
  interval?: string;
  curriculumId?: string;
  trackId?: string;
}): Promise<void> {
  const interval =
    opts.interval === "annual" ? "annual" : ("monthly" as const);

  if (opts.variantId) {
    const meta = lemonVariantMeta(opts.variantId);
    if (meta) {
      if (meta.kind === "membership") {
        await grantEntitlement({
          userId: opts.userId,
          kind: "membership",
          billingInterval: meta.interval,
          lsSubscriptionId: opts.subscriptionId,
          lsVariantId: opts.variantId,
        });
        return;
      }
      if (meta.kind === "bundle") {
        await grantEntitlement({
          userId: opts.userId,
          kind: "bundle",
          billingInterval: meta.interval,
          lsSubscriptionId: opts.subscriptionId,
          lsVariantId: opts.variantId,
        });
        await setProStatus(opts.userId, true, {
          lsSubscriptionId: opts.subscriptionId,
        });
        return;
      }
      if (meta.kind === "curriculum" && meta.curriculumId) {
        await grantEntitlement({
          userId: opts.userId,
          kind: "curriculum",
          curriculumId: meta.curriculumId,
          billingInterval: meta.interval,
          lsSubscriptionId: opts.subscriptionId,
          lsVariantId: opts.variantId,
        });
        return;
      }
      if (meta.kind === "track") {
        await grantEntitlement({
          userId: opts.userId,
          kind: "track",
          trackId: opts.trackId || undefined,
          billingInterval: meta.interval,
          lsSubscriptionId: opts.subscriptionId,
          lsVariantId: opts.variantId,
        });
        return;
      }
    }
  }

  if (
    opts.plan === "pro" ||
    opts.plan === "bundle" ||
    opts.plan.startsWith("bundle")
  ) {
    await grantEntitlement({
      userId: opts.userId,
      kind: "bundle",
      billingInterval: interval,
      lsSubscriptionId: opts.subscriptionId,
      lsVariantId: opts.variantId,
    });
    await setProStatus(opts.userId, true, {
      lsSubscriptionId: opts.subscriptionId,
    });
    return;
  }

  if (opts.plan.startsWith("curriculum:")) {
    const curriculumId = opts.plan.split(":")[1] as SellableCurriculumId;
    await grantEntitlement({
      userId: opts.userId,
      kind: "curriculum",
      curriculumId,
      billingInterval: interval,
      lsSubscriptionId: opts.subscriptionId,
      lsVariantId: opts.variantId,
    });
    return;
  }

  if (opts.plan.startsWith("track:") || opts.trackId) {
    await grantEntitlement({
      userId: opts.userId,
      kind: "track",
      trackId: opts.trackId || opts.plan.split(":")[1],
      billingInterval: interval,
      lsSubscriptionId: opts.subscriptionId,
      lsVariantId: opts.variantId,
    });
  }
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
        interval?: string;
        curriculum_id?: string;
        track_id?: string;
      };
    };
    data?: {
      id?: string;
      attributes?: {
        user_email?: string;
        customer_email?: string;
        variant_id?: number;
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
  const userId = await resolveUserId(custom.user_id, email);
  const plan = custom.plan ?? "unknown";
  const subscriptionId =
    event.startsWith("subscription") ? payload.data?.id ?? undefined : undefined;
  const orderId =
    event === "order_created" ? payload.data?.id ?? undefined : undefined;
  const variantId = payload.data?.attributes?.variant_id
    ? String(payload.data.attributes.variant_id)
    : undefined;

  try {
    if (
      event === "subscription_created" ||
      event === "subscription_payment_success" ||
      (event === "order_created" && plan !== "tutor_hour")
    ) {
      await notifyFounder({
        kind: "waitlist",
        summary: `Lemon Squeezy: ${event}`,
        fields: { email, plan, userId },
      });
      if (userId) {
        await grantFromCheckout({
          userId,
          plan,
          subscriptionId,
          variantId,
          interval: custom.interval,
          curriculumId: custom.curriculum_id || undefined,
          trackId: custom.track_id || undefined,
        });
      }
    }

    if (event === "subscription_cancelled" || event === "subscription_expired") {
      await notifyFounder({
        kind: "waitlist",
        summary: `Lemon Squeezy subscription ended: ${event}`,
        fields: { email, userId },
      });
      if (subscriptionId) {
        await revokeEntitlementsBySubscription(subscriptionId);
      } else if (userId) {
        await setProStatus(userId, false);
      }
    }
  } catch (e) {
    console.error("Lemon webhook:", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
