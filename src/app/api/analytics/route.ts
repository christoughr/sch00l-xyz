import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { z } from "zod";

const postSchema = z.object({
  event: z.string().min(1).max(64),
  sessionId: z.string().min(1).max(128),
  props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  path: z.string().max(256).optional(),
});

export async function POST(req: Request) {
  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (admin) {
    const { error } = await admin.from("analytics_events").insert({
      session_id: parsed.data.sessionId,
      event_name: parsed.data.event,
      props: {
        ...parsed.data.props,
        path: parsed.data.path ?? null,
      },
    });
    if (error) {
      console.error("Analytics insert:", error);
    }
  }

  return NextResponse.json({ ok: true });
}
