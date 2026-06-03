/** Revenue model — sch00l keeps maximum platform share where possible */

export const PLATFORM_FEE = {
  /** Human tutor: student pays hourly; sch00l keeps this % */
  humanTutorPercent: 18,
  /** Pro subscription: 100% to sch00l (no rev share) */
  proMarginPercent: 100,
  /** School B2B: per-seat SaaS, 100% to sch00l */
  schoolMarginPercent: 100,
} as const;

export const PRICING = {
  free: {
    name: "Free",
    price: 0,
    aiSessionsPerDay: 3,
    features: [
      "3 AI study sessions per day",
      "Pre/post quizzes & learning lift",
      "Flashcards (SM-2 spaced repetition)",
      "Browser-only progress",
    ],
  },
  pro: {
    name: "sch00l Pro",
    priceMonthly: 14.99,
    priceAnnual: 119,
    features: [
      "Unlimited AI tutor sessions",
      "Cloud sync across devices",
      "Priority human tutor matching",
      "Advanced progress history",
    ],
  },
  humanTutor: {
    name: "Human tutor",
    /** Display anchor — actual rates are market ranges per subject */
    studentRatePerHour: 42,
    rateFrom: 28,
    rateTo: 95,
    platformFeePerHour: 0,
    tutorPayoutPerHour: 0,
    features: [
      "Market rates — typically $28–$95/hr by subject",
      "You pick budget tier; tutors bid in range",
      "AI session summary included — no repeating yourself",
      "Pay only after you approve a match",
    ],
  },
  school: {
    name: "School / classroom",
    pricePerStudentMonth: 9,
    minimumSeats: 30,
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
