import { paymentConfig } from "@/lib/payments";
import { NextResponse } from "next/server";

export async function GET() {
  const cfg = paymentConfig();
  return NextResponse.json({
    provider: cfg.provider,
    proReady: cfg.proReady,
    tutorReady: cfg.tutorReady,
  });
}
