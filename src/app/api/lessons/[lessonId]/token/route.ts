import { createClient } from "@/lib/supabase/server";
import { issueLessonSessionToken } from "@/lib/lesson-session-token";
import { getTrackAccess } from "@/lib/track-access";
import type { StudyTrackId } from "@/lib/study-tracks";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { data: lesson } = await supabase
    .from("course_lessons")
    .select("id, unit_id, review_status")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson || lesson.review_status !== "published") {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const { data: unit } = await supabase
    .from("course_units")
    .select("track_id")
    .eq("id", lesson.unit_id)
    .maybeSingle();

  if (!unit?.track_id) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  const access = await getTrackAccess(user.id, unit.track_id as StudyTrackId);
  if (!access.full) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  const { token, expiresAt } = issueLessonSessionToken(lessonId, user.id);
  return NextResponse.json({ token, expiresAt });
}
