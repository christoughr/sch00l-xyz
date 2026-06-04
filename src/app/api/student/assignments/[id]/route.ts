import { createClient } from "@/lib/supabase/server";
import { getSectionLabel } from "@/lib/track-sections";
import { STUDY_TRACKS } from "@/lib/study-tracks";
import { NextResponse } from "next/server";

/** Fetch a single assignment visible to the logged-in student. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: assignment, error } = await supabase
    .from("classroom_assignments")
    .select(
      "id, classroom_id, title, study_track_id, section_id, topic, due_at, assign_to_all"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: memberships } = await supabase
    .from("classroom_members")
    .select("classroom_id")
    .eq("user_id", user.id);

  const memberOf = new Set((memberships ?? []).map((m) => m.classroom_id));
  if (!memberOf.has(assignment.classroom_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!assignment.assign_to_all) {
    const { data: targeted } = await supabase
      .from("assignment_targets")
      .select("user_id")
      .eq("assignment_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!targeted) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const track = STUDY_TRACKS.find((t) => t.id === assignment.study_track_id);
  const topic =
    assignment.topic ??
    (assignment.study_track_id && assignment.section_id
      ? `${track?.label ?? assignment.study_track_id} — ${getSectionLabel(assignment.study_track_id, assignment.section_id)}`
      : track?.topic ?? null);

  const { data: completion } = await supabase
    .from("assignment_completions")
    .select("completed_at, post_score, pre_score")
    .eq("assignment_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    assignment: {
      id: assignment.id,
      classroomId: assignment.classroom_id,
      title: assignment.title,
      studyTrackId: assignment.study_track_id,
      sectionId: assignment.section_id,
      topic,
      dueAt: assignment.due_at,
      trackLabel: track?.label,
      sectionLabel: getSectionLabel(
        assignment.study_track_id ?? "",
        assignment.section_id
      ),
      completed: !!completion,
      completedAt: completion?.completed_at ?? null,
      postScore: completion?.post_score ?? null,
    },
  });
}
