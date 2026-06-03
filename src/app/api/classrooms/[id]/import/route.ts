import { createClient } from "@/lib/supabase/server";
import { parseCanvasCcXml, parseRosterCsv } from "@/lib/classroom-import";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const jsonSchema = z.object({
  source: z.enum(["google_classroom", "canvas_csv", "canvas_cc"]),
  csvText: z.string().max(500_000).optional(),
  xmlText: z.string().max(2_000_000).optional(),
});

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

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("teacher_id, join_code, name")
    .eq("id", classroomId)
    .single();

  if (!classroom || (classroom.teacher_id !== user.id && !isTeacherEmail(user.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let source: "google_classroom" | "canvas_csv" | "canvas_cc" = "google_classroom";
  let csvText = "";
  let xmlText = "";

  const ctype = req.headers.get("content-type") ?? "";
  if (ctype.includes("multipart/form-data")) {
    const form = await req.formData();
    const s = form.get("source");
    if (s === "canvas_csv" || s === "google_classroom" || s === "canvas_cc") {
      source = s;
    }
    const file = form.get("file");
    if (file instanceof File) {
      const text = await file.text();
      if (source === "canvas_cc" || file.name.endsWith(".xml") || file.name.endsWith(".imscc")) {
        xmlText = text;
        source = "canvas_cc";
      } else {
        csvText = text;
      }
    }
  } else {
    const parsed = jsonSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid import" }, { status: 400 });
    }
    source = parsed.data.source;
    csvText = parsed.data.csvText ?? "";
    xmlText = parsed.data.xmlText ?? "";
  }

  let emails: string[] = [];
  let moduleTitle: string | undefined;

  if (source === "canvas_cc" && xmlText) {
    const cc = parseCanvasCcXml(xmlText);
    moduleTitle = cc.title;
    const roster = parseRosterCsv(csvText);
    emails = roster.emails;
  } else {
    const roster = parseRosterCsv(csvText);
    emails = roster.emails;
    if (emails.length === 0) {
      return NextResponse.json(
        { error: "No valid emails found. CSV needs an Email column." },
        { status: 400 }
      );
    }
  }

  const { error } = await supabase.from("classroom_imports").insert({
    classroom_id: classroomId,
    teacher_id: user.id,
    source,
    row_count: emails.length,
    emails,
  });

  if (error && error.code !== "42P01") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const inviteMessage = `Join ${classroom.name} on sch00l.ai\nhttps://sch00l.ai/join\nCode: ${classroom.join_code}`;

  return NextResponse.json({
    ok: true,
    source,
    emailCount: emails.length,
    emails,
    moduleTitle,
    inviteMessage,
  });
}
