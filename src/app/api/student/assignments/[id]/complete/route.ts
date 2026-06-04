import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  preScore: z.number().int().min(0).max(100).nullable().optional(),
  postScore: z.number().int().min(0).max(100).nullable().optional(),
});

/** Mark assignment complete after a study session. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assignmentId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: assignment } = await supabase
    .from("classroom_assignments")
    .select("id, classroom_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  const { data: member } = await supabase
    .from("classroom_members")
    .select("classroom_id")
    .eq("classroom_id", assignment.classroom_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("assignment_completions").upsert(
    {
      assignment_id: assignmentId,
      user_id: user.id,
      pre_score: parsed.data.preScore ?? null,
      post_score: parsed.data.postScore ?? null,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "assignment_id,user_id" }
  );

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: "Run migration 015_study_content.sql" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
