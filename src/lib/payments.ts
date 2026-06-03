import {
  createLemonCheckout,
  isLemonSqueezyConfigured,
  lemonSuccessUrl,
  lemonVariantIds,
} from "./lemonsqueezy";
import { getStripe, isStripeConfigured, stripePriceIds } from "./stripe";
import { SITE_URL } from "./site";

export type PaymentPlan = "pro" | "tutor_hour";

export function paymentConfig() {
  const lemon = isLemonSqueezyConfigured();
  const stripe = isStripeConfigured();
  const lemonVariants = lemonVariantIds();
  const stripePrices = stripePriceIds();

  const proReady =
    (lemon && !!lemonVariants.pro) ||
    (stripe && !!stripePrices.proMonthly);
  const tutorReady =
    (lemon && !!lemonVariants.tutor) ||
    (stripe && !!stripePrices.tutorHour);

  let provider: "lemonsqueezy" | "stripe" | null = null;
  if (lemon && (lemonVariants.pro || lemonVariants.tutor)) {
    provider = "lemonsqueezy";
  } else if (stripe && (stripePrices.proMonthly || stripePrices.tutorHour)) {
    provider = "stripe";
  }

  return { provider, proReady, tutorReady, lemon, stripe };
}

export async function startCheckout(
  plan: PaymentPlan,
  email?: string,
  userId?: string
): Promise<{ url: string } | { error: string; fallbackUrl: string }> {
  const { provider } = paymentConfig();
  const base = SITE_URL.replace(/\/$/, "");

  if (provider === "lemonsqueezy") {
    const variants = lemonVariantIds();
    const variantId = plan === "pro" ? variants.pro : variants.tutor;
    if (!variantId) {
      return {
        error: "Price not configured",
        fallbackUrl: plan === "pro" ? "/#waitlist" : "/tutors",
      };
    }
    const url = await createLemonCheckout({
      variantId,
      plan,
      email,
      userId,
      redirectUrl: lemonSuccessUrl(plan),
    });
    if (url) return { url };
    return {
      error: "Checkout unavailable",
      fallbackUrl: plan === "pro" ? "/#waitlist" : "/tutors",
    };
  }

  if (provider === "stripe") {
    const stripe = getStripe();
    const prices = stripePriceIds();
    if (!stripe) {
      return { error: "Stripe unavailable", fallbackUrl: "/#waitlist" };
    }
    const isPro = plan === "pro";
    const priceId = isPro ? prices.proMonthly : prices.tutorHour;
    if (!priceId) {
      return {
        error: "Price not configured",
        fallbackUrl: plan === "pro" ? "/#waitlist" : "/tutors",
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
      metadata: { plan },
    });
    if (session.url) return { url: session.url };
    return { error: "Could not start checkout", fallbackUrl: "/pricing" };
  }

  return {
    error: "Payments not configured",
    fallbackUrl: plan === "pro" ? "/#waitlist" : "/tutors",
  };
}
