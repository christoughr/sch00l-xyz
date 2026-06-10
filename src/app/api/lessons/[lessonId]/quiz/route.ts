import { createClient } from "@/lib/supabase/server";
import { getTrackAccess } from "@/lib/track-access";
import type { StudyTrackId } from "@/lib/study-tracks";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json({ questions: [], hint: "Database unavailable" });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
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

  const { data: items, error } = await supabase
    .from("lesson_quiz_items")
    .select("id, ord, prompt, choices, correct_index, explanation")
    .eq("lesson_id", lessonId)
    .order("ord", { ascending: true });

  if (error?.code === "42P01") {
    return NextResponse.json({
      questions: [],
      hint: "Run migration 029_lesson_quiz_items.sql",
    });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const questions = (items ?? []).map((item) => ({
    id: item.id,
    question: item.prompt,
    options: Array.isArray(item.choices) ? (item.choices as string[]) : [],
    correctIndex: item.correct_index,
    explanation: item.explanation ?? "",
  }));

  return NextResponse.json({ questions });
}
