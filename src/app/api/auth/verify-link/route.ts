import { createAdminClient } from "@/lib/supabase/admin";
import { createSupabaseRouteClient } from "@/lib/supabase/route-handler";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { EmailOtpType } from "@supabase/supabase-js";

const schema = z.object({
  token_hash: z.string().min(10),
  type: z.enum([
    "magiclink",
    "email",
    "signup",
    "invite",
    "recovery",
    "email_change",
  ]),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const ctx = createSupabaseRouteClient(req);
  if (!ctx) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
  }

  const { supabase, jsonWithSession } = ctx;
  const { token_hash, type } = parsed.data;

  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as EmailOtpType,
  });

  if (error) {
    return jsonWithSession(
      {
        error: error.message,
        code: error.code ?? "verify_failed",
      },
      { status: 401 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let redirect = "/study";

  if (user) {
    const admin = createAdminClient();
    if (admin && isTeacherEmail(user.email)) {
      await admin
        .from("profiles")
        .update({ onboarding_complete: true, role: "teacher" })
        .eq("id", user.id);
      redirect = "/teacher";
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", user.id)
        .single();
      if (!profile?.onboarding_complete) {
        redirect = "/onboarding";
      }
    }
  }

  return jsonWithSession({ ok: true, redirect });
}
