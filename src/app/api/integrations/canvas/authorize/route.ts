import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const domain = url.searchParams.get("domain")?.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const teacherId = url.searchParams.get("teacherId");

  if (!domain || !teacherId) {
    return NextResponse.json(
      { error: "domain and teacherId required" },
      { status: 400 }
    );
  }

  const clientId = process.env.CANVAS_CLIENT_ID;
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  if (!clientId) {
    return NextResponse.json(
      { error: "Canvas OAuth not configured for this deployment" },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== teacherId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const redirectUri = `${site}/api/integrations/canvas/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    state: `${teacherId}|${domain}`,
  });

  return NextResponse.redirect(
    `https://${domain}/login/oauth2/auth?${params}`
  );
}
