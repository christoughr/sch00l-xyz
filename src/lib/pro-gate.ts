import { loadEntitlements } from "@/lib/entitlements";
import { createAdminClient } from "@/lib/supabase/admin";

export async function isProUserId(userId: string): Promise<boolean> {
  const snap = await loadEntitlements(userId);
  return snap.isPro;
}

export async function setProStatus(
  userId: string,
  isPro: boolean,
  extra?: { lsSubscriptionId?: string; lsOrderId?: string }
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("profiles")
    .update({
      is_pro: isPro,
      pro_since: isPro ? new Date().toISOString() : null,
      ls_subscription_id: extra?.lsSubscriptionId ?? null,
      ls_order_id: extra?.lsOrderId ?? null,
    })
    .eq("id", userId);
}
