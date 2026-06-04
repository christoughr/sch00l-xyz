import { createAdminClient } from "@/lib/supabase/admin";
import { LOCAL_PRACTICE_TESTS } from "@/lib/practice-catalog";
import { NextResponse } from "next/server";

const MIGRATION = "010_epics_b_through_h.sql";

/** Public exam catalog — readable without auth. Falls back to bundled banks. */
export async function GET() {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({
      tests: LOCAL_PRACTICE_TESTS,
      source: "local",
    });
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
      return NextResponse.json({
        tests: LOCAL_PRACTICE_TESTS,
        source: "local",
        migrationRequired: MIGRATION,
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tests =
    data && data.length > 0
      ? data.map((t) => ({
          id: t.id,
          label: t.label,
          examFamily: t.exam_family,
          region: t.region,
          durationMinutes: t.duration_minutes,
          sectionCount: t.section_count,
        }))
      : LOCAL_PRACTICE_TESTS;

  return NextResponse.json({
    tests,
    source: data && data.length > 0 ? "database" : "local",
  });
}
