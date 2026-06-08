import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { SellableCurriculumId } from "@/lib/pricing";
import { STUDY_TRACKS, type StudyTrackId } from "@/lib/study-tracks";

export type EntitlementKind = "membership" | "curriculum" | "track" | "bundle";

export type UserEntitlement = {
  id: string;
  kind: EntitlementKind;
  curriculum_id: string | null;
  track_id: string | null;
  billing_interval: "monthly" | "annual" | null;
  active: boolean;
};

export type EntitlementSnapshot = {
  hasMembership: boolean;
  hasBundle: boolean;
  curricula: SellableCurriculumId[];
  tracks: string[];
  /** Legacy unlimited AI flag */
  isPro: boolean;
};

function trackCategory(trackId: string): SellableCurriculumId | null {
  const track = STUDY_TRACKS.find((t) => t.id === trackId);
  if (!track || track.category === "custom") return null;
  return track.category;
}

export function snapshotFromRows(
  rows: UserEntitlement[],
  isProFallback = false
): EntitlementSnapshot {
  const active = rows.filter((r) => r.active);
  const hasBundle = active.some((r) => r.kind === "bundle");
  const hasMembership =
    hasBundle || active.some((r) => r.kind === "membership");
  const curricula = [
    ...new Set(
      active
        .filter((r) => r.kind === "curriculum" && r.curriculum_id)
        .map((r) => r.curriculum_id as SellableCurriculumId)
    ),
  ];
  const tracks = [
    ...new Set(
      active
        .filter((r) => r.kind === "track" && r.track_id)
        .map((r) => r.track_id as string)
    ),
  ];
  return {
    hasMembership,
    hasBundle,
    curricula,
    tracks,
    isPro: isProFallback || hasBundle,
  };
}

export function canAccessTrack(
  snapshot: EntitlementSnapshot,
  trackId: StudyTrackId
): boolean {
  if (snapshot.hasBundle) return true;
  if (snapshot.tracks.includes(trackId)) return true;
  const category = trackCategory(trackId);
  if (!category) return false;
  return (
    snapshot.hasMembership && snapshot.curricula.includes(category)
  );
}

export async function loadEntitlements(
  userId: string
): Promise<EntitlementSnapshot> {
  const admin = createAdminClient();
  const client = admin ?? (await createClient());
  if (!client) {
    return snapshotFromRows([]);
  }

  const { data: profile } = await client
    .from("profiles")
    .select("is_pro, has_membership")
    .eq("id", userId)
    .maybeSingle();

  const { data: rows, error } = await client
    .from("user_entitlements")
    .select("id, kind, curriculum_id, track_id, billing_interval, active")
    .eq("user_id", userId)
    .eq("active", true);

  if (error?.code === "42P01") {
    return snapshotFromRows([], !!profile?.is_pro);
  }

  const snap = snapshotFromRows(
    (rows ?? []) as UserEntitlement[],
    !!profile?.is_pro
  );
  if (!snap.hasMembership && profile?.has_membership) {
    snap.hasMembership = true;
  }
  return snap;
}

export async function grantEntitlement(opts: {
  userId: string;
  kind: EntitlementKind;
  curriculumId?: string;
  trackId?: string;
  billingInterval?: "monthly" | "annual";
  lsSubscriptionId?: string;
  lsVariantId?: string;
}): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  let deactivate = admin
    .from("user_entitlements")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("user_id", opts.userId)
    .eq("kind", opts.kind)
    .eq("active", true);

  if (opts.curriculumId) {
    deactivate = deactivate.eq("curriculum_id", opts.curriculumId);
  } else {
    deactivate = deactivate.is("curriculum_id", null);
  }
  if (opts.trackId) {
    deactivate = deactivate.eq("track_id", opts.trackId);
  } else {
    deactivate = deactivate.is("track_id", null);
  }
  await deactivate;

  await admin.from("user_entitlements").insert({
    user_id: opts.userId,
    kind: opts.kind,
    curriculum_id: opts.curriculumId ?? null,
    track_id: opts.trackId ?? null,
    billing_interval: opts.billingInterval ?? null,
    ls_subscription_id: opts.lsSubscriptionId ?? null,
    ls_variant_id: opts.lsVariantId ?? null,
    active: true,
    granted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (opts.kind === "membership" || opts.kind === "bundle") {
    await admin
      .from("profiles")
      .update({
        has_membership: true,
        ...(opts.kind === "bundle"
          ? { is_pro: true, pro_since: new Date().toISOString() }
          : {}),
      })
      .eq("id", opts.userId);
  }
}

export async function revokeEntitlementsBySubscription(
  lsSubscriptionId: string
): Promise<void> {
  const admin = createAdminClient();
  if (!admin || !lsSubscriptionId) return;

  const { data: rows } = await admin
    .from("user_entitlements")
    .select("user_id, kind")
    .eq("ls_subscription_id", lsSubscriptionId)
    .eq("active", true);

  await admin
    .from("user_entitlements")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("ls_subscription_id", lsSubscriptionId);

  const userIds = [...new Set((rows ?? []).map((r) => r.user_id as string))];
  for (const userId of userIds) {
    const { data: remaining } = await admin
      .from("user_entitlements")
      .select("id, kind, curriculum_id, track_id, billing_interval, active")
      .eq("user_id", userId)
      .eq("active", true);
    const snap = snapshotFromRows((remaining ?? []) as UserEntitlement[]);
    await admin
      .from("profiles")
      .update({
        has_membership: snap.hasMembership,
        is_pro: snap.hasBundle,
        pro_since: snap.hasBundle ? new Date().toISOString() : null,
      })
      .eq("id", userId);
  }
}
