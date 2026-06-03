import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ connected: false }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ connected: false });
  }

  const { data } = await supabase
    .from("teacher_integrations")
    .select("status, meta, updated_at")
    .eq("teacher_id", user.id)
    .eq("provider", "google_classroom")
    .maybeSingle();

  return NextResponse.json({
    connected: data?.status === "connected",
    lastSyncAt: (data?.meta as { lastSyncAt?: string })?.lastSyncAt ?? null,
    updatedAt: data?.updated_at ?? null,
  });
}
