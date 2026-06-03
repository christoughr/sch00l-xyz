import { createAdminClient } from "@/lib/supabase/admin";
import { notifyFounder } from "@/lib/founder-notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(80),
  subjects: z.array(z.string().max(40)).min(1).max(8),
  bio: z.string().max(500).optional(),
  credentials: z.string().max(300).optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limited = rateLimit(`tutor-apply:${ip}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many applications. Try later." },
      { status: 429 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, displayName, subjects, bio, credentials } = parsed.data;
  const admin = createAdminClient();

  if (admin) {
    const { error } = await admin.from("tutor_applications").insert({
      email: email.toLowerCase().trim(),
      display_name: displayName.trim(),
      subjects,
      bio: bio?.trim() ?? null,
      credentials: credentials?.trim() ?? null,
      status: "pending",
    });

    if (error) {
      console.error("Tutor apply:", error);
      return NextResponse.json(
        { error: "Could not submit application" },
        { status: 500 }
      );
    }

    await notifyFounder({
      kind: "tutor_apply",
      summary: "New tutor application (cloud)",
      fields: {
        email: email.toLowerCase().trim(),
        name: displayName.trim(),
        subjects: subjects.join(", "),
      },
    });

    return NextResponse.json({
      ok: true,
      mode: "cloud" as const,
      message: "Application received. We'll review and email you.",
    });
  }

  await notifyFounder({
    kind: "tutor_apply",
    summary: "New tutor application",
    fields: {
      email: email.toLowerCase().trim(),
      name: displayName.trim(),
      subjects: subjects.join(", "),
      bio: bio?.trim() ?? null,
    },
  });

  return NextResponse.json({
    ok: true,
    mode: "local" as const,
    message: "Application received! We'll email you within a few days.",
  });
}
