import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const MIGRATION = "010_epics_b_through_h.sql";

/** Public exam catalog — readable without auth. */
export async function GET() {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data, error } = await admin
    .from("practice_tests")
    .select("id, label, exam_family, region, duration_minutes, section_count")
    .order("label", { ascending: true });

  if (error) {
    const missing =
      error.code === "42P01" ||
      error.message?.includes("practice_tests") ||
      error.message?.includes("schema cache");
    if (missing) {
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
