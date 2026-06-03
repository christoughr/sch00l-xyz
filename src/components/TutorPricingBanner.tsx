"use client";

import { tutorRateRange, formatRateRange, COMPETITIVE_NOTE } from "@/lib/tutor-pricing";
import type { SubjectId } from "@/lib/types";
import type { TutorBudgetTier } from "@/lib/tutor-pricing";

export function TutorPricingBanner({
  subject,
  tier = "standard",
}: {
  subject: SubjectId;
  tier?: TutorBudgetTier;
}) {
  const range = tutorRateRange(subject, tier);
  return (
    <div className="rounded-xl border border-brand-400/25 bg-brand-500/10 px-4 py-3 text-sm">
      <p className="text-brand-200 font-medium">{formatRateRange(range)}</p>
      <p className="text-zinc-500 text-xs mt-1">{COMPETITIVE_NOTE}</p>
    </div>
  );
}
