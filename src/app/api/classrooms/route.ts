import { createClient } from "@/lib/supabase/server";
import { generateJoinCode, isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { z } from "zod";

async function requireTeacher() {
  const supabase = await createClient();
  if (!supabase) return { error: NextResponse.json({ error: "Supabase not configured" }, { status: 503 }) };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isTeacher =
    profile?.role === "teacher" || isTeacherEmail(user.email);

  if (!isTeacher) {
    return { error: NextResponse.json({ error: "Teacher access required" }, { status: 403 }) };
  }

  if (profile?.role !== "teacher" && isTeacherEmail(user.email)) {
    await supabase.from("profiles").update({ role: "teacher" }).eq("id", user.id);
  }

  return { supabase, user };
}

export async function GET() {
  const auth = await requireTeacher();
  if ("error" in auth && auth.error) return auth.error;
  const { supabase, user } = auth as { supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>; user: { id: string } };

  const { data, error } = await supabase
    .from("classrooms")
    .select("id, name, join_code, created_at")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ classrooms: data ?? [] });
}

const createSchema = z.object({
  name: z.string().min(2).max(80),
});

export async function POST(req: Request) {
  const auth = await requireTeacher();
  if ("error" in auth && auth.error) return auth.error;
  const { supabase, user } = auth as { supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>; user: { id: string } };

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid classroom name" }, { status: 400 });
  }

  let joinCode = generateJoinCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from("classrooms")
      .insert({
        teacher_id: user.id,
        name: parsed.data.name,
        join_code: joinCode,
      })
      .select()
      .single();

    if (!error && data) {
      return NextResponse.json({ classroom: data });
    }
    if (error?.code === "23505") {
      joinCode = generateJoinCode();
      continue;
    }
    return NextResponse.json({ error: error?.message ?? "Failed" }, { status: 500 });
  }

  return NextResponse.json({ error: "Could not create classroom" }, { status: 500 });
}
