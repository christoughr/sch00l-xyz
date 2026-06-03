import { createClient } from "@/lib/supabase/server";
import { STUDY_TRACKS } from "@/lib/study-tracks";
import { getSectionLabel } from "@/lib/track-sections";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ assignments: [] });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ assignments: [] });
  }

  const { data: memberships } = await supabase
    .from("classroom_members")
    .select("classroom_id")
    .eq("user_id", user.id);

  const classIds = (memberships ?? []).map((m) => m.classroom_id);
  if (classIds.length === 0) {
    return NextResponse.json({ assignments: [] });
  }

  const { data: allAssignments, error } = await supabase
    .from("classroom_assignments")
    .select(
      "id, classroom_id, title, study_track_id, section_id, topic, due_at, assign_to_all, created_at"
    )
    .in("classroom_id", classIds)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ assignments: [] });
  }

  const targetedIds: string[] = [];
  for (const a of allAssignments ?? []) {
    if (!a.assign_to_all) targetedIds.push(a.id);
  }

  let allowedTargetIds = new Set<string>();
  if (targetedIds.length > 0) {
    const { data: targets } = await supabase
      .from("assignment_targets")
      .select("assignment_id")
      .eq("user_id", user.id)
      .in("assignment_id", targetedIds);
    allowedTargetIds = new Set((targets ?? []).map((t) => t.assignment_id));
  }

  const visible = (allAssignments ?? []).filter(
    (a) => a.assign_to_all || allowedTargetIds.has(a.id)
  );

  return NextResponse.json({
    assignments: visible.map((a) => {
      const track = STUDY_TRACKS.find((t) => t.id === a.study_track_id);
      return {
        id: a.id,
        classroomId: a.classroom_id,
        title: a.title,
        studyTrackId: a.study_track_id,
        trackLabel: track?.label,
        sectionLabel: getSectionLabel(a.study_track_id ?? "", a.section_id),
        topic: a.topic,
        dueAt: a.due_at,
        studyUrl: `/study?track=${encodeURIComponent(a.study_track_id ?? "")}&assignment=${a.id}`,
      };
    }),
  });
}
