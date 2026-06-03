import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const MIGRATION = "010_epics_b_through_h.sql";
const FLAG_THRESHOLD = 0.55;

const checkSchema = z.object({
  text: z.string().min(20).max(50_000),
  flagIfHigh: z.boolean().optional(),
});

function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  return new Set(words);
}

function wordOverlapScore(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const w of a) {
    if (b.has(w)) shared++;
  }
  return shared / Math.max(a.size, b.size);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: classroomId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = checkSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid text sample" }, { status: 400 });
  }

  const { data: member } = await supabase
    .from("classroom_members")
    .select("user_id")
    .eq("classroom_id", classroomId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("teacher_id")
    .eq("id", classroomId)
    .single();

  const isTeacher = classroom?.teacher_id === user.id;
  if (!member && !isTeacher) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sampleTokens = tokenize(parsed.data.text);

  const [{ data: notes }, { data: priorChecks }] = await Promise.all([
    supabase
      .from("peer_notes")
      .select("id, title, body, author_id")
      .eq("classroom_id", classroomId)
      .eq("approved", true),
    supabase
      .from("plagiarism_checks")
      .select("id, text_sample, submitter_id, similarity_score")
      .eq("classroom_id", classroomId)
      .neq("submitter_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  let maxScore = 0;
  let matchSource: string | null = null;
  let matchId: string | null = null;

  for (const note of notes ?? []) {
    if (note.author_id === user.id) continue;
    const score = wordOverlapScore(
      sampleTokens,
      tokenize(`${note.title} ${note.body}`)
    );
    if (score > maxScore) {
      maxScore = score;
      matchSource = "peer_note";
      matchId = note.id;
    }
  }

  for (const check of priorChecks ?? []) {
    const score = wordOverlapScore(sampleTokens, tokenize(check.text_sample));
    if (score > maxScore) {
      maxScore = score;
      matchSource = "prior_check";
      matchId = check.id;
    }
  }

  const similarityScore = Math.round(maxScore * 10000) / 100;
  const flagged =
    parsed.data.flagIfHigh !== false && maxScore >= FLAG_THRESHOLD;

  const { data: row, error } = await supabase
    .from("plagiarism_checks")
    .insert({
      classroom_id: classroomId,
      submitter_id: user.id,
      text_sample: parsed.data.text.slice(0, 10_000),
      similarity_score: similarityScore,
      flagged,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION}`, migrationRequired: MIGRATION },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: row.id,
    similarityScore,
    flagged,
    threshold: FLAG_THRESHOLD,
    matchSource,
    matchId,
    ok: true,
  });
}
