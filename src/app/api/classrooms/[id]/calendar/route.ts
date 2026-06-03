import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";

function formatIcalDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcal(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
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

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, name, teacher_id")
    .eq("id", classroomId)
    .single();

  if (!classroom) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isTeacher =
    classroom.teacher_id === user.id || isTeacherEmail(user.email);

  if (!isTeacher) {
    const { data: member } = await supabase
      .from("classroom_members")
      .select("user_id")
      .eq("classroom_id", classroomId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: assignments, error } = await supabase
    .from("classroom_assignments")
    .select("id, title, due_at, topic")
    .eq("classroom_id", classroomId)
    .not("due_at", "is", null)
    .order("due_at", { ascending: true });

  if (error) {
    if (error.code === "42P01") {
      return new NextResponse("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR", {
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "X-Migration-Required": "008_assignments_materials.sql",
        },
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = formatIcalDate(new Date().toISOString());
  const calName = escapeIcal(`${classroom.name} — sch00l assignments`);

  const events = (assignments ?? [])
    .filter((a) => a.due_at)
    .map((a) => {
      const uid = `${a.id}@sch00l.ai`;
      const dtstamp = now;
      const dtend = formatIcalDate(a.due_at!);
      const summary = escapeIcal(a.title);
      const description = escapeIcal(a.topic ?? "Assignment due");
      return [
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTEND:${dtend}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        "END:VEVENT",
      ].join("\r\n");
    })
    .join("\r\n");

  const ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//sch00l.ai//Classroom Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calName}`,
    events,
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new NextResponse(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="classroom-${classroomId}.ics"`,
    },
  });
}
