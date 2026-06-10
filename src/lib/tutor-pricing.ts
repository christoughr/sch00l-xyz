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
  math: { min: 85, typical: 115, max: 225 },
  science: { min: 90, typical: 120, max: 235 },
  english: { min: 80, typical: 105, max: 195 },
  history: { min: 80, typical: 100, max: 175 },
  cs: { min: 95, typical: 135, max: 250 },
  languages: { min: 82, typical: 110, max: 200 },
  economics: { min: 85, typical: 115, max: 220 },
  psychology: { min: 82, typical: 105, max: 195 },
  geography: { min: 78, typical: 95, max: 160 },
  philosophy: { min: 82, typical: 110, max: 200 },
  art: { min: 78, typical: 100, max: 165 },
  music: { min: 85, typical: 120, max: 210 },
  business: { min: 90, typical: 125, max: 230 },
  engineering: { min: 100, typical: 145, max: 250 },
  health: { min: 92, typical: 125, max: 235 },
  statistics: { min: 88, typical: 118, max: 220 },
  social_studies: { min: 78, typical: 95, max: 165 },
  other: { min: 78, typical: 100, max: 170 },
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
