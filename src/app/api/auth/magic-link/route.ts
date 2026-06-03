import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  isResendConfigured,
  magicLinkEmailHtml,
  sendViaResend,
} from "@/lib/resend";
import { SITE_URL } from "@/lib/site";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(254),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limited = rateLimit(`magic-link:${ip}`, {
    limit: 8,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  if (!isResendConfigured()) {
    return NextResponse.json(
      { error: "Email service not configured", mode: "supabase" },
      { status: 503 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase admin not configured" },
      { status: 503 }
    );
  }

  const next = isTeacherEmail(email) ? "/teacher" : "/study";
  const redirectTo = `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error || !data?.properties?.action_link) {
    return NextResponse.json(
      {
        error: error?.message ?? "Could not generate sign-in link",
      },
      { status: 500 }
    );
  }

  const actionLink = data.properties.action_link;
  const sent = await sendViaResend({
    to: email,
    subject: "Sign in to sch00l.ai",
    html: magicLinkEmailHtml(email, actionLink),
  });

  if (!sent.ok) {
    return NextResponse.json(
      {
        error: sent.error,
        hint:
          "Verify sch00l.ai domain in Resend, or set RESEND_FROM to a verified address.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, mode: "resend" });
}
