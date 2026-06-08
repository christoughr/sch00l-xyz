import {
  createLemonCheckout,
  isLemonSqueezyConfigured,
  lemonSuccessUrl,
  lemonVariantIds,
  resolveLemonVariantId,
  type LemonCheckoutKind,
  type LemonCheckoutRequest,
} from "./lemonsqueezy";
import { getStripe, isStripeConfigured, stripePriceIds } from "./stripe";
import { SITE_URL } from "./site";

/** Legacy plan ids */
export type PaymentPlan = "pro" | "tutor_hour";

export type CheckoutRequest =
  | { plan: PaymentPlan }
  | LemonCheckoutRequest;

export function paymentConfig() {
  const lemon = isLemonSqueezyConfigured();
  const stripe = isStripeConfigured();
  const lemonVariants = lemonVariantIds();
  const stripePrices = stripePriceIds();

  const proReady =
    (lemon &&
      (!!lemonVariants.pro ||
        !!lemonVariants.bundle_monthly ||
        !!lemonVariants.bundle_annual)) ||
    (stripe && !!stripePrices.proMonthly);
  const tutorReady =
    (lemon && !!lemonVariants.tutor) ||
    (stripe && !!stripePrices.tutorHour);
  const membershipReady =
    lemon &&
    (!!lemonVariants.membership_monthly ||
      !!lemonVariants.membership_annual);
  const bundleReady =
    lemon &&
    (!!lemonVariants.bundle_monthly ||
      !!lemonVariants.bundle_annual ||
      !!lemonVariants.pro);

  let provider: "lemonsqueezy" | "stripe" | null = null;
  if (lemon && (lemonVariants.pro || lemonVariants.tutor || bundleReady)) {
    provider = "lemonsqueezy";
  } else if (stripe && (stripePrices.proMonthly || stripePrices.tutorHour)) {
    provider = "stripe";
  }

  return {
    provider,
    proReady,
    tutorReady,
    membershipReady,
    bundleReady,
    lemon,
    stripe,
  };
}

function toLemonRequest(req: CheckoutRequest): LemonCheckoutRequest | null {
  if ("plan" in req) {
    if (req.plan === "pro") return { kind: "pro", interval: "monthly" };
    if (req.plan === "tutor_hour") return { kind: "tutor_hour" };
    return null;
  }
  return req;
}

export async function startCheckout(
  req: CheckoutRequest,
  email?: string,
  userId?: string
): Promise<{ url: string } | { error: string; fallbackUrl: string }> {
  const { provider } = paymentConfig();
  const base = SITE_URL.replace(/\/$/, "");
  const lemonReq = toLemonRequest(req);
  const legacyPlan =
    "plan" in req ? req.plan : lemonReq?.kind === "tutor_hour" ? "tutor_hour" : "pro";

  if (provider === "lemonsqueezy" && lemonReq) {
    const variantId = resolveLemonVariantId(lemonReq);
    if (!variantId) {
      return {
        error: "Price not configured",
        fallbackUrl: legacyPlan === "pro" ? "/#waitlist" : "/tutors",
      };
    }
    const kind: LemonCheckoutKind = lemonReq.kind;
    const planLabel =
      kind === "curriculum" && lemonReq.curriculumId
        ? `curriculum:${lemonReq.curriculumId}`
        : kind === "track" && lemonReq.trackId
          ? `track:${lemonReq.trackId}`
          : kind;
    const url = await createLemonCheckout({
      variantId,
      plan: planLabel,
      email,
      userId,
      redirectUrl: lemonSuccessUrl(kind),
      custom: {
        interval: lemonReq.interval ?? "monthly",
        curriculum_id: lemonReq.curriculumId ?? "",
        track_id: lemonReq.trackId ?? "",
      },
    });
    if (url) return { url };
    return {
      error: "Checkout unavailable",
      fallbackUrl: legacyPlan === "pro" ? "/#waitlist" : "/tutors",
    };
  }

  if (provider === "stripe" && "plan" in req) {
    const stripe = getStripe();
    const prices = stripePriceIds();
    if (!stripe) {
      return { error: "Stripe unavailable", fallbackUrl: "/#waitlist" };
    }
    const isPro = req.plan === "pro";
    const priceId = isPro ? prices.proMonthly : prices.tutorHour;
    if (!priceId) {
      return {
        error: "Price not configured",
        fallbackUrl: req.plan === "pro" ? "/#waitlist" : "/tutors",
      };
    }
    const session = await stripe.checkout.sessions.create({
      mode: isPro ? "subscription" : "payment",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: isPro
        ? `${base}/pro/success?session_id={CHECKOUT_SESSION_ID}`
        : `${base}/tutors?paid=1`,
      cancel_url: `${base}/pricing`,
      metadata: { plan: req.plan },
    });
    if (session.url) return { url: session.url };
    return { error: "Could not start checkout", fallbackUrl: "/pricing" };
  }

  return {
    error: "Payments not configured",
    fallbackUrl: legacyPlan === "pro" ? "/#waitlist" : "/tutors",
  };
}
