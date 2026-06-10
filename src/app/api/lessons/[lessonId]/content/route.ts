import { createClient } from "@/lib/supabase/server";
import {
  verifyLessonSessionToken,
  watermarkLessonBody,
} from "@/lib/lesson-session-token";
import { getTrackAccess } from "@/lib/track-access";
import type { StudyTrackId } from "@/lib/study-tracks";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

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

  if (!verifyLessonSessionToken(token, lessonId, user.id)) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
  }

  const { data: lesson } = await supabase
    .from("course_lessons")
    .select("id, title, body_markdown, unit_id, review_status")
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

  const body = watermarkLessonBody(lesson.body_markdown ?? "", user.email);

  return NextResponse.json({
    id: lesson.id,
    title: lesson.title,
    body_markdown: body,
    expiresInSeconds: 300,
  });
}
