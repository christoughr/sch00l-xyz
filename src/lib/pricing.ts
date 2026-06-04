/** Revenue model — sch00l keeps maximum platform share where possible */

/** Single source of truth for free-tier session cap (all UI + enforcement). */
export const FREE_AI_SESSIONS_PER_DAY = 3;

export const PLATFORM_FEE = {
  /** Human tutor: student pays hourly; sch00l keeps this % */
  humanTutorPercent: 55,
  /** Pro subscription: 100% to sch00l (no rev share) */
  proMarginPercent: 100,
  /** School B2B: per-seat SaaS, 100% to sch00l */
  schoolMarginPercent: 100,
} as const;

export const PRICING = {
  free: {
    name: "Free",
    price: 0,
    aiSessionsPerDay: FREE_AI_SESSIONS_PER_DAY,
    features: [
      `${FREE_AI_SESSIONS_PER_DAY} AI study sessions per day`,
      "Pre/post quizzes & learning lift",
      "Flashcards (SM-2 spaced repetition)",
      "Browser-only progress",
    ],
  },
  pro: {
    name: "sch00l Pro",
    priceMonthly: 149.99,
    priceAnnual: 1499,
    features: [
      "Unlimited AI tutor sessions",
      "Cloud sync across devices",
      "Priority human tutor matching",
      "Advanced progress history",
      "Class lift analytics export",
    ],
  },
  humanTutor: {
    name: "Human tutor",
    /** Display anchor — actual rates are market ranges per subject */
    studentRatePerHour: 120,
    rateFrom: 60,
    rateTo: 200,
    platformFeePerHour: 0,
    tutorPayoutPerHour: 0,
    features: [
      "Market rates — typically $60–$200/hr by subject",
      "You pick budget tier; tutors bid in range",
      "AI session summary included — no repeating yourself",
      "Pay only after you approve a match",
    ],
  },
  school: {
    name: "School / classroom",
    pricePerStudentMonth: 49,
    minimumSeats: 10,
    features: [
      "Class-wide learning lift dashboard",
      "Teacher roster & analytics",
      "COPPA/FERPA-friendly setup",
      "Volume pricing for districts",
    ],
  },
} as const;

export function formatUsd(n: number): string {
  return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;
}

/** Marketing copy — use everywhere instead of hardcoding session counts. */
export function freeSessionsMarketingLabel(): string {
  const n: number = PRICING.free.aiSessionsPerDay;
  return `${n} AI session${n === 1 ? "" : "s"}/day`;
}

export function freeSessionsShortLabel(): string {
  const n: number = PRICING.free.aiSessionsPerDay;
  return `${n} session${n === 1 ? "" : "s"}/day`;
}
