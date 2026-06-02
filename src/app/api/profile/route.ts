import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ profile: null });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ profile: null });
  }

  const { data } = await supabase
    .from("profiles")
    .select(
      "display_name, grade_level, birth_year, onboarding_complete, role, email"
    )
    .eq("id", user.id)
    .single();

  return NextResponse.json({ profile: data, email: user.email });
}

const patchSchema = z.object({
  display_name: z.string().max(80).optional(),
  grade_level: z.string().max(80).optional(),
  birth_year: z.number().int().min(1990).max(new Date().getFullYear()).optional(),
  is_under_13: z.boolean().optional(),
  parental_consent: z.boolean().optional(),
  terms_accepted: z.boolean().optional(),
  onboarding_complete: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, mode: "local" as const });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const d = parsed.data;
  const updates: Record<string, unknown> = {};

  if (d.display_name !== undefined) updates.display_name = d.display_name;
  if (d.grade_level !== undefined) updates.grade_level = d.grade_level;
  if (d.birth_year !== undefined) updates.birth_year = d.birth_year;
  if (d.is_under_13 !== undefined) updates.is_under_13 = d.is_under_13;
  if (d.onboarding_complete !== undefined) {
    updates.onboarding_complete = d.onboarding_complete;
  }
  if (d.terms_accepted) {
    updates.terms_accepted_at = new Date().toISOString();
  }
  if (d.parental_consent) {
    updates.parental_consent_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
