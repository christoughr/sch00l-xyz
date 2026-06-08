import type { SellableCurriculumId } from "@/lib/pricing";
import { SELLABLE_CURRICULA } from "@/lib/pricing";
import { SITE_URL } from "./site";

export type LemonCheckoutKind =
  | "membership"
  | "bundle"
  | "curriculum"
  | "track"
  | "pro"
  | "tutor_hour";

export type LemonCheckoutRequest = {
  kind: LemonCheckoutKind;
  interval?: "monthly" | "annual";
  curriculumId?: SellableCurriculumId;
  trackId?: string;
};

export function isLemonSqueezyConfigured(): boolean {
  return !!(
    process.env.LEMONSQUEEZY_API_KEY &&
    process.env.LEMONSQUEEZY_STORE_ID
  );
}

/** Env key for a Lemon Squeezy variant ID */
export function lemonVariantEnvKey(
  kind: LemonCheckoutKind,
  interval: "monthly" | "annual" = "monthly",
  curriculumId?: SellableCurriculumId
): string {
  if (kind === "pro") return "LEMONSQUEEZY_VARIANT_PRO";
  if (kind === "tutor_hour") return "LEMONSQUEEZY_VARIANT_TUTOR";
  if (kind === "membership") {
    return interval === "annual"
      ? "LEMONSQUEEZY_VARIANT_MEMBERSHIP_ANNUAL"
      : "LEMONSQUEEZY_VARIANT_MEMBERSHIP_MONTHLY";
  }
  if (kind === "bundle") {
    return interval === "annual"
      ? "LEMONSQUEEZY_VARIANT_BUNDLE_ANNUAL"
      : "LEMONSQUEEZY_VARIANT_BUNDLE_MONTHLY";
  }
  if (kind === "curriculum" && curriculumId) {
    const slug = curriculumId.toUpperCase();
    return interval === "annual"
      ? `LEMONSQUEEZY_VARIANT_CURRICULUM_${slug}_ANNUAL`
      : `LEMONSQUEEZY_VARIANT_CURRICULUM_${slug}_MONTHLY`;
  }
  if (kind === "track") {
    return interval === "annual"
      ? "LEMONSQUEEZY_VARIANT_TRACK_ANNUAL"
      : "LEMONSQUEEZY_VARIANT_TRACK_MONTHLY";
  }
  return "";
}

export function lemonVariantIds(): Record<string, string> {
  const out: Record<string, string> = {
    pro: process.env.LEMONSQUEEZY_VARIANT_PRO ?? "",
    tutor: process.env.LEMONSQUEEZY_VARIANT_TUTOR ?? "",
    membership_monthly:
      process.env.LEMONSQUEEZY_VARIANT_MEMBERSHIP_MONTHLY ?? "",
    membership_annual:
      process.env.LEMONSQUEEZY_VARIANT_MEMBERSHIP_ANNUAL ?? "",
    bundle_monthly: process.env.LEMONSQUEEZY_VARIANT_BUNDLE_MONTHLY ?? "",
    bundle_annual: process.env.LEMONSQUEEZY_VARIANT_BUNDLE_ANNUAL ?? "",
    track_monthly: process.env.LEMONSQUEEZY_VARIANT_TRACK_MONTHLY ?? "",
    track_annual: process.env.LEMONSQUEEZY_VARIANT_TRACK_ANNUAL ?? "",
  };

  for (const c of SELLABLE_CURRICULA) {
    const slug = c.id.toUpperCase();
    out[`curriculum_${c.id}_monthly`] =
      process.env[`LEMONSQUEEZY_VARIANT_CURRICULUM_${slug}_MONTHLY`] ?? "";
    out[`curriculum_${c.id}_annual`] =
      process.env[`LEMONSQUEEZY_VARIANT_CURRICULUM_${slug}_ANNUAL`] ?? "";
  }

  return out;
}

/** Reverse lookup: variant ID → checkout metadata for webhooks */
export function lemonVariantMeta(variantId: string): {
  kind: LemonCheckoutKind;
  interval: "monthly" | "annual";
  curriculumId?: SellableCurriculumId;
} | null {
  const ids = lemonVariantIds();
  for (const [key, id] of Object.entries(ids)) {
    if (!id || id !== variantId) continue;
    if (key === "pro" || key === "tutor") continue;
    if (key === "membership_monthly")
      return { kind: "membership", interval: "monthly" };
    if (key === "membership_annual")
      return { kind: "membership", interval: "annual" };
    if (key === "bundle_monthly")
      return { kind: "bundle", interval: "monthly" };
    if (key === "bundle_annual")
      return { kind: "bundle", interval: "annual" };
    if (key === "track_monthly")
      return { kind: "track", interval: "monthly" };
    if (key === "track_annual")
      return { kind: "track", interval: "annual" };
    const curM = key.match(/^curriculum_([a-z_]+)_monthly$/);
    if (curM)
      return {
        kind: "curriculum",
        interval: "monthly",
        curriculumId: curM[1] as SellableCurriculumId,
      };
    const curA = key.match(/^curriculum_([a-z_]+)_annual$/);
    if (curA)
      return {
        kind: "curriculum",
        interval: "annual",
        curriculumId: curA[1] as SellableCurriculumId,
      };
  }
  if (ids.pro === variantId)
    return { kind: "bundle", interval: "monthly" };
  return null;
}

export function resolveLemonVariantId(
  req: LemonCheckoutRequest
): string | null {
  const interval = req.interval ?? "monthly";
  const kind = req.kind === "pro" ? "bundle" : req.kind;
  const key =
    kind === "membership"
      ? interval === "annual"
        ? "membership_annual"
        : "membership_monthly"
      : kind === "bundle"
        ? interval === "annual"
          ? "bundle_annual"
          : req.kind === "pro"
            ? "pro"
            : "bundle_monthly"
        : kind === "curriculum" && req.curriculumId
          ? `curriculum_${req.curriculumId}_${interval}`
          : kind === "track"
            ? interval === "annual"
              ? "track_annual"
              : "track_monthly"
            : kind === "tutor_hour"
              ? "tutor"
              : "";

  if (!key) return null;
  const id = lemonVariantIds()[key];
  return id || null;
}

type CheckoutOpts = {
  variantId: string;
  plan: string;
  email?: string;
  userId?: string;
  redirectUrl: string;
  custom?: Record<string, string>;
};

export async function createLemonCheckout(
  opts: CheckoutOpts
): Promise<string | null> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!apiKey || !storeId || !opts.variantId) return null;

  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: opts.email,
            custom: {
              plan: opts.plan,
              user_id: opts.userId ?? "",
              ...opts.custom,
            },
          },
          product_options: {
            redirect_url: opts.redirectUrl,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: storeId } },
          variant: { data: { type: "variants", id: opts.variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    console.error("Lemon checkout:", await res.text());
    return null;
  }

  const json = (await res.json()) as {
    data?: { attributes?: { url?: string } };
  };
  return json.data?.attributes?.url ?? null;
}

export function lemonSuccessUrl(kind: LemonCheckoutKind): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL).replace(/\/$/, "");
  if (kind === "tutor_hour") return `${base}/tutors?paid=1`;
  return `${base}/pro/success`;
}
