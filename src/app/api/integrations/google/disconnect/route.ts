import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  await supabase
    .from("teacher_integrations")
    .delete()
    .eq("teacher_id", user.id)
    .eq("provider", "google_classroom");

  return NextResponse.json({ ok: true });
}
