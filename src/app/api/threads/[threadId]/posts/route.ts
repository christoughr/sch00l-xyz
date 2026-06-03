import { moderatePost } from "@/lib/forum-moderation";
import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const MIGRATION = "010_epics_b_through_h.sql";

const createSchema = z.object({
  body: z.string().min(1).max(8000),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: thread, error: tErr } = await supabase
    .from("classroom_threads")
    .select("id, classroom_id, teacher_lounge, locked")
    .eq("id", threadId)
    .single();

  if (tErr) {
    if (tErr.code === "42P01") {
      return NextResponse.json({ posts: [], migrationRequired: MIGRATION });
    }
    if (tErr.code === "PGRST116") {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
    return NextResponse.json({ error: tErr.message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("thread_posts")
    .select("id, body, author_id, flagged, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ posts: [], migrationRequired: MIGRATION });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    thread: {
      id: thread.id,
      classroomId: thread.classroom_id,
      teacherLounge: thread.teacher_lounge,
      locked: thread.locked,
    },
    posts: (data ?? []).map((p) => ({
      id: p.id,
      body: p.body,
      authorId: p.author_id,
      flagged: p.flagged,
      createdAt: p.created_at,
    })),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid post" }, { status: 400 });
  }

  const { data: thread, error: tErr } = await supabase
    .from("classroom_threads")
    .select("id, locked, classroom_id, teacher_lounge")
    .eq("id", threadId)
    .single();

  if (tErr) {
    if (tErr.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION}` },
        { status: 503 }
      );
    }
    if (tErr.code === "PGRST116") {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
    return NextResponse.json({ error: tErr.message }, { status: 500 });
  }

  if (thread.locked) {
    return NextResponse.json({ error: "Thread is locked" }, { status: 400 });
  }

  if (thread.teacher_lounge && !isTeacherEmail(user.email)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const moderation = await moderatePost(parsed.data.body);
  const { data: row, error } = await supabase
    .from("thread_posts")
    .insert({
      thread_id: threadId,
      author_id: user.id,
      body: parsed.data.body,
      flagged: moderation.flagged,
    })
    .select("id, flagged")
    .single();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION}` },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (moderation.flagged) {
    await supabase
      .from("classroom_threads")
      .update({ flagged: true })
      .eq("id", threadId);
  }

  return NextResponse.json({
    id: row.id,
    ok: true,
    flagged: row.flagged,
    moderationReason: moderation.reason,
  });
}
