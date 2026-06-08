/** Revenue model — sch00l keeps maximum platform share where possible */

import type { StudyTrackCategory } from "./study-tracks";
import { TRACK_CATEGORIES } from "./study-tracks";

/** Single source of truth for free-tier session cap (all UI + enforcement). */
export const FREE_AI_SESSIONS_PER_DAY = 1;

export type BillingInterval = "monthly" | "annual";

export type SellableCurriculumId = Exclude<StudyTrackCategory, "custom">;

const CURRICULUM_BLURBS: Record<SellableCurriculumId, string> = {
  ap: "All AP courses — Calc, Bio, Chem, Physics, Stats, and more",
  sat_act: "SAT Math, SAT Reading, ACT Math, English, Science",
  exam_prep: "GRE, GMAT, MCAT, LSAT, and professional exam tracks",
  college: "Calc I–III, Linear Algebra, Physics, Gen Chem, and semester courses",
  k12: "Middle & high school core subjects by grade band",
  languages: "Spanish, French, Mandarin, ESL, and conversation tracks",
  international: "IB, A-Levels, GCSE, and country-specific curricula",
  professional: "Certifications, bootcamps, and career upskilling paths",
};

/** Per-curriculum pricing — each library priced independently */
export const CURRICULUM_PRICES: Record<
  SellableCurriculumId,
  { priceMonthly: number; priceAnnual: number }
> = {
  ap: { priceMonthly: 349, priceAnnual: 3490 },
  sat_act: { priceMonthly: 299, priceAnnual: 2990 },
  exam_prep: { priceMonthly: 399, priceAnnual: 3990 },
  college: { priceMonthly: 379, priceAnnual: 3790 },
  k12: { priceMonthly: 249, priceAnnual: 2490 },
  languages: { priceMonthly: 229, priceAnnual: 2290 },
  international: { priceMonthly: 279, priceAnnual: 2790 },
  professional: { priceMonthly: 359, priceAnnual: 3590 },
};

export const SELLABLE_CURRICULA: {
  id: SellableCurriculumId;
  label: string;
  blurb: string;
  priceMonthly: number;
  priceAnnual: number;
}[] = TRACK_CATEGORIES.filter(
  (c): c is { id: SellableCurriculumId; label: string } =>
    c.id !== "all" && c.id !== "custom"
).map((c) => ({
  id: c.id,
  label: c.label,
  blurb: CURRICULUM_BLURBS[c.id],
  ...CURRICULUM_PRICES[c.id],
}));

export const PLATFORM_FEE = {
  /** Human tutor: student pays hourly; sch00l keeps this % */
  humanTutorPercent: 45,
  /** Paid subscriptions: 100% to sch00l (no rev share) */
  subscriptionMarginPercent: 100,
  /** School B2B: per-seat SaaS, 100% to sch00l */
  schoolMarginPercent: 100,
} as const;

/** Premium positioning — membership + per-curriculum + bundle discount */
export const PRICING = {
  free: {
    name: "Free",
    price: 0,
    aiSessionsPerDay: FREE_AI_SESSIONS_PER_DAY,
    features: [
      `${FREE_AI_SESSIONS_PER_DAY} AI study session per day`,
      "Pre/post quizzes & learning lift",
      "Flashcards (SM-2 spaced repetition)",
      "Browser-only progress",
    ],
  },
  membership: {
    name: "Platform membership",
    priceMonthly: 149,
    priceAnnual: 1490,
    features: [
      "Required seat for any paid curriculum",
      "Cloud sync across devices",
      "Unlimited AI sessions on unlocked tracks",
      "Priority human tutor matching",
      "Advanced progress history & exports",
    ],
  },
  track: {
    name: "Single course",
    priceMonthly: 129,
    priceAnnual: 1290,
    features: [
      "One full study track end-to-end",
      "Ideal when you only need one exam or semester",
      "Upgrade to a library or bundle anytime",
    ],
  },
  bundle: {
    name: "All-in-one",
    priceMonthly: 2499,
    priceAnnual: 24990,
    features: [
      "Membership + every curriculum library",
      "All current & future tracks in catalog",
      "Modest bundle discount vs à la carte",
      "Priority new-course access at launch",
    ],
  },
  /** Legacy checkout plan id — maps to all-in-one bundle */
  pro: {
    name: "sch00l Pro",
    priceMonthly: 2499,
    priceAnnual: 24990,
    features: [
      "Membership + all curriculum libraries",
      "Unlimited AI tutor sessions",
      "Cloud sync across devices",
      "Priority human tutor matching",
    ],
  },
  humanTutor: {
    name: "Human tutor",
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

export function curriculumPrice(
  id: SellableCurriculumId,
  interval: BillingInterval
): number {
  const p = CURRICULUM_PRICES[id];
  return interval === "monthly" ? p.priceMonthly : p.priceAnnual;
}

export function formatUsd(n: number): string {
  return n % 1 === 0 ? `$${n.toLocaleString("en-US")}` : `$${n.toFixed(2)}`;
}

export function priceForInterval(
  monthly: number,
  annual: number,
  interval: BillingInterval
): number {
  return interval === "monthly" ? monthly : annual;
}

export function annualSavingsPercent(monthly: number, annual: number): number {
  const fullYearMonthly = monthly * 12;
  if (fullYearMonthly <= 0) return 0;
  return Math.round(((fullYearMonthly - annual) / fullYearMonthly) * 100);
}

export function monthlyEquivalent(annual: number): number {
  return Math.round((annual / 12) * 100) / 100;
}

/** Membership + every curriculum library at individual prices */
export function alaCarteTotal(interval: BillingInterval): number {
  const m = PRICING.membership;
  const curriculaSum = SELLABLE_CURRICULA.reduce(
    (sum, c) => sum + curriculumPrice(c.id, interval),
    0
  );
  const membership =
    interval === "monthly" ? m.priceMonthly : m.priceAnnual;
  return membership + curriculaSum;
}

export function bundleSavings(interval: BillingInterval): number {
  const list = alaCarteTotal(interval);
  const bundle = priceForInterval(
    PRICING.bundle.priceMonthly,
    PRICING.bundle.priceAnnual,
    interval
  );
  return Math.max(0, list - bundle);
}

export function bundleSavingsPercent(interval: BillingInterval): number {
  const list = alaCarteTotal(interval);
  if (list <= 0) return 0;
  return Math.round((bundleSavings(interval) / list) * 100);
}

export function billingPeriodLabel(interval: BillingInterval): string {
  return interval === "monthly" ? "/mo" : "/yr";
}

export function freeSessionsMarketingLabel(): string {
  const n: number = PRICING.free.aiSessionsPerDay;
  return `${n} AI session${n === 1 ? "" : "s"}/day`;
}

export function freeSessionsShortLabel(): string {
  const n: number = PRICING.free.aiSessionsPerDay;
  return `${n} session${n === 1 ? "" : "s"}/day`;
}
