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
  math: { min: 60, typical: 90, max: 150 },
  science: { min: 62, typical: 95, max: 165 },
  english: { min: 55, typical: 80, max: 130 },
  history: { min: 55, typical: 78, max: 120 },
  cs: { min: 70, typical: 105, max: 180 },
  languages: { min: 58, typical: 85, max: 140 },
  economics: { min: 60, typical: 90, max: 150 },
  psychology: { min: 58, typical: 82, max: 135 },
  geography: { min: 55, typical: 75, max: 110 },
  philosophy: { min: 58, typical: 85, max: 140 },
  art: { min: 55, typical: 80, max: 125 },
  music: { min: 60, typical: 92, max: 150 },
  business: { min: 62, typical: 95, max: 160 },
  engineering: { min: 72, typical: 110, max: 200 },
  health: { min: 65, typical: 95, max: 165 },
  statistics: { min: 62, typical: 92, max: 155 },
  social_studies: { min: 55, typical: 75, max: 115 },
  other: { min: 55, typical: 80, max: 130 },
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
