import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function stripePriceIds() {
  return {
    proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
    tutorHour: process.env.STRIPE_PRICE_TUTOR_HOUR ?? "",
  };
}
