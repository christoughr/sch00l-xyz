/** Revenue model — sch00l keeps maximum platform share where possible */

export const PLATFORM_FEE = {
  /** Human tutor: student pays hourly; sch00l keeps this % */
  humanTutorPercent: 40,
  /** Pro subscription: 100% to sch00l (no rev share) */
  proMarginPercent: 100,
  /** School B2B: per-seat SaaS, 100% to sch00l */
  schoolMarginPercent: 100,
} as const;

export const PRICING = {
  free: {
    name: "Free",
    price: 0,
    aiSessionsPerDay: 1,
    features: [
      "1 AI study session per day",
      "Pre/post quizzes & learning lift",
      "Flashcards (SM-2 spaced repetition)",
      "Browser-only progress",
    ],
  },
  pro: {
    name: "sch00l Pro",
    priceMonthly: 79.99,
    priceAnnual: 799,
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
    studentRatePerHour: 85,
    rateFrom: 45,
    rateTo: 150,
    platformFeePerHour: 0,
    tutorPayoutPerHour: 0,
    features: [
      "Market rates — typically $45–$150/hr by subject",
      "You pick budget tier; tutors bid in range",
      "AI session summary included — no repeating yourself",
      "Pay only after you approve a match",
    ],
  },
  school: {
    name: "School / classroom",
    pricePerStudentMonth: 39,
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
