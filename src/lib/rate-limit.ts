const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now > entry.reset) {
    buckets.set(key, { count: 1, reset: now + opts.windowMs });
    return { ok: true };
  }

  if (entry.count >= opts.limit) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((entry.reset - now) / 1000),
    };
  }

  entry.count += 1;
  return { ok: true };
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
