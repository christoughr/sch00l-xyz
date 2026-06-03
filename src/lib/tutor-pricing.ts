import type { SubjectId } from "./subject-ids";

/** Market-competitive ranges — tutors set their own rate inside band. */
export type TutorBudgetTier = "budget" | "standard" | "premium" | "urgent";

export const TUTOR_MARKET = {
  platformFeePercent: 18,
  tiers: {
    budget: { label: "Budget", multiplier: 0.75 },
    standard: { label: "Standard", multiplier: 1 },
    premium: { label: "Expert", multiplier: 1.35 },
    urgent: { label: "Rush (<48h)", multiplier: 1.5 },
  },
} as const;

const BASE_RATES: Record<SubjectId, { min: number; typical: number; max: number }> = {
  math: { min: 32, typical: 48, max: 78 },
  science: { min: 34, typical: 52, max: 85 },
  english: { min: 28, typical: 42, max: 65 },
  history: { min: 28, typical: 40, max: 60 },
  cs: { min: 38, typical: 55, max: 90 },
  languages: { min: 30, typical: 45, max: 70 },
  economics: { min: 32, typical: 48, max: 72 },
  psychology: { min: 30, typical: 44, max: 68 },
  geography: { min: 28, typical: 40, max: 58 },
  philosophy: { min: 30, typical: 45, max: 70 },
  art: { min: 28, typical: 42, max: 62 },
  music: { min: 32, typical: 48, max: 75 },
  business: { min: 35, typical: 52, max: 80 },
  engineering: { min: 40, typical: 58, max: 95 },
  health: { min: 36, typical: 52, max: 82 },
  statistics: { min: 34, typical: 50, max: 78 },
  social_studies: { min: 28, typical: 40, max: 58 },
  other: { min: 28, typical: 42, max: 70 },
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
