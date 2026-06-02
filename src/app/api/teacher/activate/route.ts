import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isTeacherEmail(user.email)) {
    return NextResponse.json({ error: "Not a teacher account" }, { status: 403 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: "teacher" })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, role: "teacher" as const });
}
