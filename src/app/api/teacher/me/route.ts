import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ isTeacher: false, configured: false });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ isTeacher: false, configured: true });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isTeacher =
    profile?.role === "teacher" || isTeacherEmail(user.email);

  return NextResponse.json({
    isTeacher,
    configured: true,
    email: user.email,
  });
}
