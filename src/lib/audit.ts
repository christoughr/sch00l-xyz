import { createAdminClient } from "./supabase/admin";

export async function logAudit(opts: {
  actorId?: string | null;
  action: string;
  resourceType?: string;
  resourceId?: string;
  meta?: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("audit_log").insert({
    actor_id: opts.actorId ?? null,
    action: opts.action,
    resource_type: opts.resourceType ?? null,
    resource_id: opts.resourceId ?? null,
    meta: opts.meta ?? null,
  });
}
