import { createClient } from "@/lib/supabase/server";
import {
  applyLessonLocks,
  getTrackAccess,
} from "@/lib/track-access";
import type { StudyTrackId } from "@/lib/study-tracks";
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = await getTrackAccess(
    user?.id ?? null,
    trackId as StudyTrackId
  );

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
    return NextResponse.json({ units: [], trackId, access });
  }

  const unitIds = units.map((u) => u.id);
  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("id, unit_id, ord, title, objectives, body_markdown")
    .in("unit_id", unitIds)
    .eq("review_status", "published")
    .order("ord", { ascending: true });

  const flat: typeof lessons = [];
  for (const u of units) {
    const unitLessons = (lessons ?? [])
      .filter((l) => l.unit_id === u.id)
      .sort((a, b) => a.ord - b.ord);
    flat.push(...unitLessons);
  }
  const lockedFlat = applyLessonLocks(flat, access.full, access.previewLimit);
  const lockedById = new Map(lockedFlat.map((l) => [l.id, l]));

  const byUnit = new Map<string, typeof lockedFlat>();
  for (const lesson of lockedFlat) {
    const list = byUnit.get(lesson.unit_id) ?? [];
    list.push(lesson);
    byUnit.set(lesson.unit_id, list);
  }

  return NextResponse.json({
    trackId,
    access: {
      full: access.full,
      gated: access.gated,
      previewLimit: access.previewLimit,
    },
    units: units.map((u) => ({
      ...u,
      lessons: (byUnit.get(u.id) ?? []).map((l) => {
        const locked = lockedById.get(l.id)?.locked ?? false;
        return {
          id: l.id,
          ord: l.ord,
          title: l.title,
          objectives: l.objectives,
          locked,
          contentProtected: !locked && access.full,
          body_markdown: locked
            ? (lockedById.get(l.id)?.body_markdown ?? l.body_markdown)
            : "",
        };
      }),
    })),
  });
}
