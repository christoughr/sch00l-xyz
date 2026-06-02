import { createClient } from "@/lib/supabase/server";
import { syncProgressToDb } from "@/lib/progress-db";
import type { StudentProgress } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let progress: StudentProgress;
  try {
    progress = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await syncProgressToDb(supabase, user.id, progress);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fetchProgressFromDb } = await import("@/lib/progress-db");
  const progress = await fetchProgressFromDb(supabase, user.id);
  return NextResponse.json({ progress });
}
