import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function DELETE() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({
      ok: true,
      message: "Clear local data in Settings (browser only).",
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Server missing SUPABASE_SERVICE_ROLE_KEY" },
      { status: 503 }
    );
  }

  await admin.from("classroom_members").delete().eq("user_id", user.id);
  await admin.from("quiz_results").delete().eq("user_id", user.id);
  await admin.from("flashcards").delete().eq("user_id", user.id);
  await admin.from("mastery_topics").delete().eq("user_id", user.id);
  await admin.from("study_sessions").delete().eq("user_id", user.id);
  await admin.from("student_stats").delete().eq("user_id", user.id);
  await admin.from("profiles").delete().eq("id", user.id);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: true });
}
