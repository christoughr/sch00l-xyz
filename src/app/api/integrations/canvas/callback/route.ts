import { createAdminClient } from "@/lib/supabase/admin";
import { encryptToken } from "@/lib/token-crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  if (!code || !state) {
    return NextResponse.redirect(`${site}/teacher?oauth_error=canvas_denied`);
  }

  const [teacherId, domain] = state.split("|");
  const clientId = process.env.CANVAS_CLIENT_ID;
  const clientSecret = process.env.CANVAS_CLIENT_SECRET;

  if (!clientId || !clientSecret || !domain) {
    return NextResponse.redirect(`${site}/teacher?oauth_error=canvas_not_configured`);
  }

  const redirectUri = `${site}/api/integrations/canvas/callback`;
  const tokenRes = await fetch(`https://${domain}/login/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${site}/teacher?oauth_error=canvas_token_failed`);
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  const admin = createAdminClient();
  const accessEnc = encryptToken(tokens.access_token);
  const refreshEnc = tokens.refresh_token
    ? encryptToken(tokens.refresh_token)
    : null;

  if (admin && accessEnc) {
    await admin.from("teacher_integrations").upsert(
      {
        teacher_id: teacherId,
        provider: "canvas",
        access_token_enc: accessEnc,
        refresh_token_enc: refreshEnc,
        expires_at: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        status: "connected",
        meta: { canvasDomain: domain },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "teacher_id,provider" }
    );
  }

  return NextResponse.redirect(
    `${site}/teacher?tab=integrations&connected=canvas`
  );
}
