import { createAdminClient } from "@/lib/supabase/admin";
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

    return NextResponse.json({
      ok: true,
      mode: "cloud" as const,
      message: "Application received. We'll review and email you.",
    });
  }

  return NextResponse.json({
    ok: true,
    mode: "local" as const,
    message:
      "Application noted locally. Email support@sch00l.ai with your subjects to apply.",
  });
}
