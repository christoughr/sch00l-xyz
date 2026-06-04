import { consumeAiSession, checkAiSessionAllowed, fetchIsPro } from "@/lib/session-quota";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Server-side free-tier gate — call when starting an AI study session. */
export async function POST() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required for server quota" }, { status: 401 });
  }

  const isPro = await fetchIsPro(supabase, user.id);
  const result = await consumeAiSession(supabase, user.id, isPro);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, used: result.used, limit: result.limit },
      { status: 429 }
    );
  }

  return NextResponse.json({
    ok: true,
    isPro,
    used: result.used,
    limit: result.limit,
    remaining: isPro ? null : Math.max(0, result.limit - result.used),
  });
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
    return NextResponse.json({ authenticated: false });
  }

  const isPro = await fetchIsPro(supabase, user.id);
  const check = await checkAiSessionAllowed(supabase, user.id, isPro);

  return NextResponse.json({
    authenticated: true,
    isPro,
    used: check.used,
    limit: check.limit,
    remaining: isPro ? null : check.remaining,
    canStart: check.allowed,
  });
}
