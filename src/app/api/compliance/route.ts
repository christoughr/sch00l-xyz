import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  birthYear: z.number().int().min(1990).max(2020).optional(),
  ferpaOk: z.boolean(),
  coppaParentEmail: z.string().email().optional(),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const { error } = await supabase.from("user_compliance").upsert({
    user_id: user.id,
    birth_year: parsed.data.birthYear ?? null,
    ferpa_ok: parsed.data.ferpaOk,
    coppa_parent_email: parsed.data.coppaParentEmail ?? null,
  });

  if (error?.code === "42P01") {
    return NextResponse.json({ ok: true, migrationRequired: "010_epics_b_through_h.sql" });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
