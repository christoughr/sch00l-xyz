import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ classrooms: [] });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ classrooms: [] });
  }

  const { data: members } = await supabase
    .from("classroom_members")
    .select("classroom_id, joined_at")
    .eq("user_id", user.id);

  const ids = (members ?? []).map((m) => m.classroom_id);
  if (ids.length === 0) {
    return NextResponse.json({ classrooms: [] });
  }

  const { data: rooms } = await supabase
    .from("classrooms")
    .select("id, name, join_code")
    .in("id", ids);

  return NextResponse.json({
    classrooms: (rooms ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      joinCode: c.join_code,
      classUrl: `/class/${c.id}`,
      forumUrl: `/class/${c.id}?tab=forum`,
    })),
  });
}
