import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(4).max(12),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid join code" }, { status: 400 });
  }

  const code = parsed.data.code.toUpperCase().trim();

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to join a class" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Server missing SUPABASE_SERVICE_ROLE_KEY" },
      { status: 503 }
    );
  }

  const { data: classroom, error: findErr } = await admin
    .from("classrooms")
    .select("id, name, join_code")
    .eq("join_code", code)
    .single();

  if (findErr || !classroom) {
    return NextResponse.json({ error: "Invalid join code" }, { status: 404 });
  }

  const { error: joinErr } = await admin.from("classroom_members").upsert({
    classroom_id: classroom.id,
    user_id: user.id,
  });

  if (joinErr) {
    return NextResponse.json({ error: joinErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    classroom: { id: classroom.id, name: classroom.name },
  });
}
