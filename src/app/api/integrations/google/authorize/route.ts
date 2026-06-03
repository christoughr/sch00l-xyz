import {
  buildGoogleAuthUrl,
  googleOAuthConfigured,
} from "@/lib/google-classroom";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!googleOAuthConfigured()) {
    return NextResponse.json(
      { error: "Google OAuth not configured" },
      { status: 503 }
    );
  }

  const teacherId = new URL(req.url).searchParams.get("teacherId");
  if (!teacherId) {
    return NextResponse.json({ error: "teacherId required" }, { status: 400 });
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

  return NextResponse.redirect(buildGoogleAuthUrl(teacherId));
}
