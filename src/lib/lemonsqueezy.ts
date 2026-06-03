import { SITE_URL } from "./site";

export function isLemonSqueezyConfigured(): boolean {
  return !!(
    process.env.LEMONSQUEEZY_API_KEY &&
    process.env.LEMONSQUEEZY_STORE_ID
  );
}

export function lemonVariantIds() {
  return {
    pro: process.env.LEMONSQUEEZY_VARIANT_PRO ?? "",
    tutor: process.env.LEMONSQUEEZY_VARIANT_TUTOR ?? "",
  };
}

type CheckoutOpts = {
  variantId: string;
  plan: "pro" | "tutor_hour";
  email?: string;
  redirectUrl: string;
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
            custom: { plan: opts.plan },
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

export function lemonSuccessUrl(plan: "pro" | "tutor_hour"): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL).replace(/\/$/, "");
  return plan === "pro" ? `${base}/pro/success` : `${base}/tutors?paid=1`;
}
