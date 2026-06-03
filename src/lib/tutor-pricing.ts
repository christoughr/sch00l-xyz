import type { SubjectId } from "./subject-ids";

/** Market-competitive ranges — tutors set their own rate inside band. */
export type TutorBudgetTier = "budget" | "standard" | "premium" | "urgent";

import { PLATFORM_FEE } from "./pricing";

export const TUTOR_MARKET = {
  platformFeePercent: PLATFORM_FEE.humanTutorPercent,
  tiers: {
    budget: { label: "Budget", multiplier: 0.75 },
    standard: { label: "Standard", multiplier: 1 },
    premium: { label: "Expert", multiplier: 1.35 },
    urgent: { label: "Rush (<48h)", multiplier: 1.5 },
  },
} as const;

const BASE_RATES: Record<SubjectId, { min: number; typical: number; max: number }> = {
  math: { min: 45, typical: 65, max: 110 },
  science: { min: 48, typical: 70, max: 120 },
  english: { min: 40, typical: 58, max: 95 },
  history: { min: 40, typical: 55, max: 85 },
  cs: { min: 52, typical: 75, max: 130 },
  languages: { min: 42, typical: 62, max: 100 },
  economics: { min: 45, typical: 65, max: 105 },
  psychology: { min: 42, typical: 60, max: 98 },
  geography: { min: 40, typical: 55, max: 80 },
  philosophy: { min: 42, typical: 62, max: 100 },
  art: { min: 40, typical: 58, max: 90 },
  music: { min: 45, typical: 68, max: 110 },
  business: { min: 48, typical: 70, max: 115 },
  engineering: { min: 55, typical: 78, max: 140 },
  health: { min: 50, typical: 72, max: 115 },
  statistics: { min: 48, typical: 68, max: 110 },
  social_studies: { min: 40, typical: 55, max: 85 },
  other: { min: 40, typical: 58, max: 95 },
};

export function tutorRateRange(
  subject: SubjectId,
  tier: TutorBudgetTier = "standard"
) {
  const base = BASE_RATES[subject] ?? BASE_RATES.other;
  const mult = TUTOR_MARKET.tiers[tier].multiplier;
  return {
    min: Math.round(base.min * mult),
    typical: Math.round(base.typical * mult),
    max: Math.round(base.max * mult),
    tier,
    subject,
  };
}

export function formatRateRange(r: ReturnType<typeof tutorRateRange>): string {
  return `$${r.min}–$${r.max}/hr · typical ~$${r.typical}`;
}

export function formatRateFrom(r: ReturnType<typeof tutorRateRange>): string {
  return `From $${r.min}/hr`;
}

/** Cheaper than typical marketplace anchors (Wyzant $40–100+, Varsity $70+). */
export const COMPETITIVE_NOTE =
  "Tutors bid inside your range — you approve the match. No fixed $49/hr lock-in.";
