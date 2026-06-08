import { createClient } from "@/lib/supabase/server";
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
