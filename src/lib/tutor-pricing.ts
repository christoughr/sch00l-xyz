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
  math: { min: 65, typical: 95, max: 165 },
  science: { min: 68, typical: 100, max: 175 },
  english: { min: 60, typical: 85, max: 140 },
  history: { min: 60, typical: 82, max: 130 },
  cs: { min: 75, typical: 110, max: 185 },
  languages: { min: 62, typical: 88, max: 145 },
  economics: { min: 65, typical: 95, max: 160 },
  psychology: { min: 62, typical: 85, max: 140 },
  geography: { min: 58, typical: 78, max: 115 },
  philosophy: { min: 62, typical: 88, max: 145 },
  art: { min: 58, typical: 82, max: 125 },
  music: { min: 65, typical: 95, max: 155 },
  business: { min: 68, typical: 100, max: 170 },
  engineering: { min: 78, typical: 115, max: 185 },
  health: { min: 70, typical: 100, max: 170 },
  statistics: { min: 68, typical: 98, max: 165 },
  social_studies: { min: 58, typical: 78, max: 120 },
  other: { min: 58, typical: 82, max: 130 },
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
