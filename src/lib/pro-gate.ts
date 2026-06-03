import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function isProUserId(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const client = admin ?? (await createClient());
  if (!client) return false;

  const { data } = await client
    .from("profiles")
    .select("is_pro")
    .eq("id", userId)
    .maybeSingle();

  return !!data?.is_pro;
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
