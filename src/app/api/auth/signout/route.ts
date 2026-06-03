import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Clears Supabase auth cookies server-side (required for real logout with SSR). */
export async function POST() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  return NextResponse.json({ ok: true });
}
