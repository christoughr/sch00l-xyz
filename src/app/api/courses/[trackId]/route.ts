import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  const { trackId } = await params;
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json({ units: [], source: "none" });
  }

  const { data: units, error: unitsErr } = await supabase
    .from("course_units")
    .select("id, ord, title, description")
    .eq("track_id", trackId)
    .order("ord", { ascending: true });

  if (unitsErr?.code === "42P01") {
    return NextResponse.json({
      units: [],
      hint: "Run migrations 017 and 018_seed_ap_bio_course.sql",
    });
  }

  if (!units?.length) {
    return NextResponse.json({ units: [], trackId });
  }

  const unitIds = units.map((u) => u.id);
  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("id, unit_id, ord, title, objectives, body_markdown")
    .in("unit_id", unitIds)
    .eq("review_status", "published")
    .order("ord", { ascending: true });

  const byUnit = new Map<string, typeof lessons>();
  for (const lesson of lessons ?? []) {
    const list = byUnit.get(lesson.unit_id) ?? [];
    list.push(lesson);
    byUnit.set(lesson.unit_id, list);
  }

  return NextResponse.json({
    trackId,
    units: units.map((u) => ({
      ...u,
      lessons: byUnit.get(u.id) ?? [],
    })),
  });
}
