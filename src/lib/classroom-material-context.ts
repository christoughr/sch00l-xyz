import { createAdminClient } from "./supabase/admin";

const EXCERPT_MAX = 3500;

/** Latest material excerpts for a classroom (tutor / quiz context). */
export async function getClassroomMaterialContext(
  classroomId: string
): Promise<string> {
  const admin = createAdminClient();
  if (!admin) return "";

  const { data } = await admin
    .from("classroom_materials")
    .select("file_name, extracted_text")
    .eq("classroom_id", classroomId)
    .order("created_at", { ascending: false })
    .limit(3);

  if (!data?.length) return "";

  const blocks = data
    .filter((m) => m.extracted_text?.trim())
    .map(
      (m) =>
        `--- ${m.file_name} ---\n${(m.extracted_text ?? "").slice(0, 1200)}`
    );

  if (!blocks.length) return "";
  return `\nTeacher course materials (use for context, stay Socratic):\n${blocks.join("\n\n")}`.slice(
    0,
    EXCERPT_MAX
  );
}
