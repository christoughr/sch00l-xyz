import { clientIp, rateLimit } from "@/lib/rate-limit";
import { startCheckout } from "@/lib/payments";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["pro", "tutor_hour"]),
  email: z.string().email().optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limited = rateLimit(`payments-checkout:${ip}`, {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await startCheckout(parsed.data.plan, parsed.data.email);

  if ("url" in result) {
    return NextResponse.json({ url: result.url });
  }

  return NextResponse.json(
    { error: result.error, fallbackUrl: result.fallbackUrl },
    { status: 503 }
  );
}
