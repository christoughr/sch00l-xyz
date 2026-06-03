import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";
import { NextResponse } from "next/server";
import { z } from "zod";

const MIGRATION = "010_epics_b_through_h.sql";

const reportSchema = z.object({
  reporterEmail: z.string().email(),
  contentUrl: z.union([z.string().url(), z.literal("")]).optional(),
  description: z.string().min(20).max(5000),
});

export async function POST(req: Request) {
  const parsed = reportSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid DMCA report" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = parsed.data;
  const { data: row, error } = await admin
    .from("dmca_reports")
    .insert({
      reporter_email: body.reporterEmail,
      content_url: body.contentUrl || null,
      description: body.description,
      status: "open",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        {
          error: `Run migration ${MIGRATION} in Supabase SQL editor`,
          migrationRequired: MIGRATION,
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit({
    action: "dmca.report",
    resourceType: "dmca",
    resourceId: row.id,
    meta: { reporterEmail: body.reporterEmail },
  });

  return NextResponse.json({ id: row.id, ok: true, status: "open" });
}
