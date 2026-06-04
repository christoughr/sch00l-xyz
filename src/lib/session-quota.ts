import { PRICING } from "./pricing";

export const FREE_SESSIONS_PER_DAY = PRICING.free.aiSessionsPerDay;

// Minimal typing for server Supabase client (profiles + daily_ai_usage).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getDailyUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("daily_ai_usage")
    .select("session_count")
    .eq("user_id", userId)
    .eq("usage_date", todayUtc())
    .maybeSingle();

  if (error?.code === "42P01") return 0;
  return data?.session_count ?? 0;
}

export async function fetchIsPro(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", userId)
    .maybeSingle();
  return !!data?.is_pro;
}

export async function checkAiSessionAllowed(
  supabase: SupabaseClient,
  userId: string,
  isPro: boolean
): Promise<{ allowed: boolean; used: number; limit: number; remaining: number }> {
  const limit = FREE_SESSIONS_PER_DAY;
  if (isPro) {
    return { allowed: true, used: 0, limit, remaining: Infinity };
  }
  const used = await getDailyUsage(supabase, userId);
  const remaining = Math.max(0, limit - used);
  return { allowed: used < limit, used, limit, remaining };
}

export async function consumeAiSession(
  supabase: SupabaseClient,
  userId: string,
  isPro: boolean
): Promise<{ ok: boolean; used: number; limit: number; error?: string }> {
  const limit = FREE_SESSIONS_PER_DAY;
  if (isPro) return { ok: true, used: 0, limit };

  const check = await checkAiSessionAllowed(supabase, userId, false);
  if (!check.allowed) {
    return {
      ok: false,
      used: check.used,
      limit,
      error: `Free plan allows ${limit} AI session${limit === 1 ? "" : "s"} per day. Upgrade to Pro for unlimited.`,
    };
  }

  const today = todayUtc();
  const next = check.used + 1;
  const { error } = await supabase.from("daily_ai_usage").upsert(
    {
      user_id: userId,
      usage_date: today,
      session_count: next,
    },
    { onConflict: "user_id,usage_date" }
  );

  if (error) {
    if (error.code === "42P01") {
      return { ok: false, used: check.used, limit, error: "Run migration 016_daily_ai_usage.sql" };
    }
    return { ok: false, used: check.used, limit, error: error.message ?? "Could not record session" };
  }

  return { ok: true, used: next, limit };
}
