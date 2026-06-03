import { isStripeConfigured, stripePriceIds } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET() {
  const prices = stripePriceIds();
  return NextResponse.json({
    enabled: isStripeConfigured(),
    proPriceConfigured: !!prices.proMonthly,
    tutorPriceConfigured: !!prices.tutorHour,
  });
}
