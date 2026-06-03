import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { suggestAssignmentFromMaterial } from "@/lib/material-auto-assign";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  assignToAll: z.boolean().optional(),
  studentIds: z.array(z.string().uuid()).optional(),
  title: z.string().max(120).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  const { id: classroomId, materialId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("teacher_id")
    .eq("id", classroomId)
    .single();

  if (!classroom || (classroom.teacher_id !== user.id && !isTeacherEmail(user.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const { data: material } = await admin
    .from("classroom_materials")
    .select("id, file_name, extracted_text, classroom_id")
    .eq("id", materialId)
    .eq("classroom_id", classroomId)
    .single();

  if (!material) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  const opts = parsed.success ? parsed.data : {};

  const suggestion = await suggestAssignmentFromMaterial(
    material.file_name,
    material.extracted_text ?? ""
  );

  if (!suggestion) {
    return NextResponse.json({ error: "Could not match a study track" }, { status: 422 });
  }

  const title = opts.title ?? suggestion.title;
  const assignToAll = opts.assignToAll !== false && !opts.studentIds?.length;

  const { data: assignment, error } = await admin
    .from("classroom_assignments")
    .insert({
      classroom_id: classroomId,
      teacher_id: user.id,
      title,
      study_track_id: suggestion.studyTrackId,
      section_id: suggestion.sectionId,
      topic: suggestion.topic,
      material_id: materialId,
      assign_to_all: assignToAll,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!assignToAll && opts.studentIds?.length) {
    await admin.from("assignment_targets").insert(
      opts.studentIds.map((uid) => ({
        assignment_id: assignment.id,
        user_id: uid,
      }))
    );
  }

  await admin
    .from("classroom_materials")
    .update({
      auto_track_id: suggestion.studyTrackId,
      auto_section_id: suggestion.sectionId,
    })
    .eq("id", materialId);

  return NextResponse.json({
    assignmentId: assignment.id,
    suggestion,
  });
}
