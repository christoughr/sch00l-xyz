import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const MIGRATION = "010_epics_b_through_h.sql";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("practice_tests")
    .select("id, label, exam_family, region, duration_minutes, section_count")
    .order("label", { ascending: true });

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ tests: [], migrationRequired: MIGRATION });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    tests: (data ?? []).map((t) => ({
      id: t.id,
      label: t.label,
      examFamily: t.exam_family,
      region: t.region,
      durationMinutes: t.duration_minutes,
      sectionCount: t.section_count,
    })),
  });
}
