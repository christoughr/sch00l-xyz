/** Revenue model — optimized for conversion + margin (not sticker shock). */

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
  k12: "K–8 core + US high school diploma pathways",
  languages: "Spanish, French, Mandarin, ESL, and conversation tracks",
  international: "OSSD, IB, A-Levels, GCSE, and country-specific curricula",
  professional: "Certifications, bootcamps, and career upskilling paths",
};

/**
 * Premium pricing: reflects full course libraries + AI tutor value.
 * Still below enterprise sticker shock; annual ≈ 10× monthly (~17% off vs monthly×12).
 */
export const CURRICULUM_PRICES: Record<
  SellableCurriculumId,
  { priceMonthly: number; priceAnnual: number }
> = {
  ap: { priceMonthly: 119, priceAnnual: 1190 },
  sat_act: { priceMonthly: 109, priceAnnual: 1090 },
  exam_prep: { priceMonthly: 139, priceAnnual: 1390 },
  college: { priceMonthly: 119, priceAnnual: 1190 },
  k12: { priceMonthly: 99, priceAnnual: 990 },
  languages: { priceMonthly: 89, priceAnnual: 890 },
  international: { priceMonthly: 109, priceAnnual: 1090 },
  professional: { priceMonthly: 119, priceAnnual: 1190 },
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
  humanTutorPercent: 45,
  subscriptionMarginPercent: 100,
  schoolMarginPercent: 100,
} as const;

export const PRICING = {
  free: {
    name: "Free",
    price: 0,
    aiSessionsPerDay: FREE_AI_SESSIONS_PER_DAY,
    features: [
      `${FREE_AI_SESSIONS_PER_DAY} AI study session per day (tutor only)`,
      "Browse track catalog — lessons require subscription",
      "Study Notebook preview",
      "No course lesson access without paid plan",
    ],
  },
  membership: {
    name: "Platform membership",
    priceMonthly: 79,
    priceAnnual: 790,
    features: [
      "Required seat for any paid curriculum",
      "Cloud sync across devices",
      "Unlimited AI sessions on unlocked tracks",
      "Study Notebook — upload notes, Q&A, quiz me",
      "Priority human tutor matching",
    ],
  },
  track: {
    name: "Single course",
    priceMonthly: 79,
    priceAnnual: 790,
    features: [
      "One full study track end-to-end",
      "Ideal when you only need one exam or semester",
      "Upgrade to a library or bundle anytime",
    ],
  },
  bundle: {
    name: "All-in-one",
    priceMonthly: 449,
    priceAnnual: 4490,
    features: [
      "Membership + every curriculum library",
      "All current & future tracks in catalog",
      "Best value vs buying libraries separately",
      "Priority new-course access at launch",
    ],
  },
  pro: {
    name: "sch00l Pro",
    priceMonthly: 449,
    priceAnnual: 4490,
    features: [
      "Membership + all curriculum libraries",
      "Unlimited AI tutor sessions",
      "Study Notebook + full course libraries",
      "Cloud sync across devices",
    ],
  },
  humanTutor: {
    name: "Human tutor",
    studentRatePerHour: 115,
    rateFrom: 85,
    rateTo: 225,
    platformFeePerHour: 0,
    tutorPayoutPerHour: 0,
    features: [
      "Market rates — typically $85–$225/hr by subject",
      "You pick budget tier; tutors bid in range",
      "AI session summary included — no repeating yourself",
      "Pay only after you approve a match",
    ],
  },
  school: {
    name: "School / classroom",
    pricePerStudentMonth: 29,
    minimumSeats: 10,
    features: [
      "Class-wide learning lift dashboard",
      "Teacher roster & analytics",
      "COPPA/FERPA-friendly setup",
      "Volume pricing for districts",
    ],
  },
  family: {
    name: "Family plan",
    seats: 4,
    priceMonthly: 199,
    priceAnnual: 1990,
    features: [
      "Up to 4 student seats on one membership",
      "Shared billing — curricula purchased per seat or bundle",
      "Each seat gets cloud sync and progress",
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

export function totalWithMembership(
  curriculumMonthly: number,
  curriculumAnnual: number,
  interval: BillingInterval
): number {
  return (
    priceForInterval(
      PRICING.membership.priceMonthly,
      PRICING.membership.priceAnnual,
      interval
    ) +
    priceForInterval(curriculumMonthly, curriculumAnnual, interval)
  );
}

export function freeSessionsMarketingLabel(): string {
  const n: number = PRICING.free.aiSessionsPerDay;
  return `${n} AI session${n === 1 ? "" : "s"}/day`;
}

export function freeSessionsShortLabel(): string {
  const n: number = PRICING.free.aiSessionsPerDay;
  return `${n} session${n === 1 ? "" : "s"}/day`;
}
