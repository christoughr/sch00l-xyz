import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractTextFromBuffer } from "@/lib/material-extract";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;
const BUCKET = "classroom-materials";

async function assertTeacher(classroomId: string, userId: string, email?: string) {
  const supabase = await createClient();
  if (!supabase) return { error: NextResponse.json({ error: "No Supabase" }, { status: 503 }) };

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, teacher_id")
    .eq("id", classroomId)
    .single();

  if (!classroom) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  if (classroom.teacher_id !== userId && !isTeacherEmail(email)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { supabase, classroom };
}

export async function GET(
  _req: Request,
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

  const auth = await assertTeacher(classroomId, user.id, user.email);
  if ("error" in auth && auth.error) return auth.error;

  const { data, error } = await supabase
    .from("classroom_materials")
    .select(
      "id, file_name, mime_type, byte_size, storage_path, auto_track_id, auto_section_id, created_at"
    )
    .eq("classroom_id", classroomId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ materials: [], migrationRequired: "008_assignments_materials.sql" });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ materials: data ?? [] });
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

  const auth = await assertTeacher(classroomId, user.id, user.email);
  if ("error" in auth && auth.error) return auth.error;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Max file size 10 MB" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server storage not configured" }, { status: 503 });
  }

  const buffer = await file.arrayBuffer();
  const extractedText = await extractTextFromBuffer(
    buffer,
    file.type || "application/octet-stream",
    file.name
  );

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const storagePath = `${classroomId}/${crypto.randomUUID()}/${safeName}`;

  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadErr) {
    return NextResponse.json(
      {
        error: uploadErr.message.includes("Bucket")
          ? "Create storage bucket classroom-materials (run migration 009)"
          : uploadErr.message,
      },
      { status: 500 }
    );
  }

  const { data: row, error: dbErr } = await admin
    .from("classroom_materials")
    .insert({
      classroom_id: classroomId,
      teacher_id: user.id,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type || null,
      byte_size: file.size,
      extracted_text: extractedText,
    })
    .select("id, file_name, created_at")
    .single();

  if (dbErr) {
    await admin.storage.from(BUCKET).remove([storagePath]);
    if (dbErr.code === "42P01") {
      return NextResponse.json(
        { error: "Run migration 008_assignments_materials.sql in Supabase" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({
    material: row,
    extractedPreview: extractedText.slice(0, 500),
  });
}
