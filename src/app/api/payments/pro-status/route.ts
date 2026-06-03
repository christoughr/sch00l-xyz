import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const ip = clientIp(req);
  const limited = rateLimit(`payments-pro-status:${ip}`, {
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { isPro: false, mode: "rate_limited" as const },
      { status: 429 }
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ isPro: false, mode: "local" as const });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ isPro: false, mode: "anonymous" as const });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("is_pro, pro_since")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Pro status:", error);
    return NextResponse.json({
      isPro: false,
      mode: "cloud" as const,
      reason: "profile_unavailable",
    });
  }

  return NextResponse.json({
    isPro: !!data?.is_pro,
    mode: "cloud" as const,
    proSince: data?.pro_since ?? null,
  });
}
