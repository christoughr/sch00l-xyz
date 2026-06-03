import {
  exchangeGoogleCode,
  googleOAuthConfigured,
  siteUrl,
  storeGoogleTokens,
} from "@/lib/google-classroom";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const teacherId = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error || !code || !teacherId) {
    return NextResponse.redirect(
      `${siteUrl()}/teacher?oauth_error=${encodeURIComponent(error ?? "denied")}`
    );
  }

  if (!googleOAuthConfigured()) {
    return NextResponse.json(
      { error: "Google OAuth not configured" },
      { status: 503 }
    );
  }

  const tokens = await exchangeGoogleCode(code);
  if (!tokens) {
    return NextResponse.redirect(
      `${siteUrl()}/teacher?oauth_error=token_exchange_failed`
    );
  }

  const ok = await storeGoogleTokens(teacherId, tokens);
  if (!ok) {
    return NextResponse.redirect(
      `${siteUrl()}/teacher?oauth_error=storage_failed`
    );
  }

  return NextResponse.redirect(
    `${siteUrl()}/teacher?tab=integrations&connected=google`
  );
}
