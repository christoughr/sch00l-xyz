import { loadEntitlements } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      hasMembership: false,
      hasBundle: false,
      curricula: [],
      tracks: [],
      isPro: false,
    });
  }

  const snapshot = await loadEntitlements(user.id);
  return NextResponse.json(snapshot);
}
