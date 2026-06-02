import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({
      export: {
        note: "Sign in with Supabase for cloud export. Local data is in browser storage.",
        localKeys: [
          "sch00l_progress_v1",
          "sch00l_flashcards_v1",
          "sch00l_quiz_results_v1",
        ],
      },
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile, stats, sessions, mastery, flashcards, quizzes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("student_stats").select("*").eq("user_id", user.id).single(),
      supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("mastery_topics").select("*").eq("user_id", user.id),
      supabase.from("flashcards").select("*").eq("user_id", user.id),
      supabase
        .from("quiz_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    email: user.email,
    profile: profile.data,
    stats: stats.data,
    sessions: sessions.data ?? [],
    mastery: mastery.data ?? [],
    flashcards: flashcards.data ?? [],
    quizzes: quizzes.data ?? [],
  });
}
