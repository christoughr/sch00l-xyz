/** Peak revenue model — premium libraries, high-ROI exam tracks, full catalog bundle. */

import type { StudyTrackCategory } from "./study-tracks";
import { TRACK_CATEGORIES } from "./study-tracks";

/** Single source of truth for free-tier session cap (all UI + enforcement). */
export const FREE_AI_SESSIONS_PER_DAY = 1;

export type BillingInterval = "monthly" | "annual";

export type SellableCurriculumId = Exclude<StudyTrackCategory, "custom">;

/** Annual ≈ 10× monthly (~17% off vs paying monthly × 12). */
export const ANNUAL_MULTIPLIER = 10;

function annualFromMonthly(monthly: number): number {
  return monthly * ANNUAL_MULTIPLIER;
}

const CURRICULUM_BLURBS: Record<SellableCurriculumId, string> = {
  ap: "All AP courses — Calc, Bio, Chem, Physics, Stats, and more",
  sat_act: "SAT Math, SAT Reading, ACT Math, English, Science",
  exam_prep: "GRE, GMAT, MCAT, LSAT, USMLE, and professional exam tracks",
  college: "Calc I–III, Linear Algebra, Physics, Gen Chem, and semester courses",
  k12: "K–8 core + US high school diploma pathways",
  languages: "Spanish, French, Mandarin, ESL, and conversation tracks",
  international: "OSSD, IB, A-Levels, GCSE, and country-specific curricula",
  professional: "Certifications, bootcamps, and career upskilling paths",
};

/** Peak library pricing — every category priced as a premium product. */
export const CURRICULUM_PRICES: Record<
  SellableCurriculumId,
  { priceMonthly: number; priceAnnual: number }
> = {
  k12: { priceMonthly: 149, priceAnnual: annualFromMonthly(149) },
  languages: { priceMonthly: 129, priceAnnual: annualFromMonthly(129) },
  international: { priceMonthly: 199, priceAnnual: annualFromMonthly(199) },
  sat_act: { priceMonthly: 249, priceAnnual: annualFromMonthly(249) },
  ap: { priceMonthly: 279, priceAnnual: annualFromMonthly(279) },
  college: { priceMonthly: 279, priceAnnual: annualFromMonthly(279) },
  professional: { priceMonthly: 299, priceAnnual: annualFromMonthly(299) },
  exam_prep: { priceMonthly: 499, priceAnnual: annualFromMonthly(499) },
};

/** Default single-track price when no exam-specific override exists. */
export const PEAK_STANDARD_TRACK = {
  priceMonthly: 199,
  priceAnnual: annualFromMonthly(199),
} as const;

/** High-ROI exams — top of the peak tier (law, medicine, grad school). */
export const PREMIUM_TRACK_PRICES: Record<
  string,
  { priceMonthly: number; priceAnnual: number; label: string }
> = {
  lsat: { priceMonthly: 499, priceAnnual: annualFromMonthly(499), label: "LSAT" },
  gmat: { priceMonthly: 479, priceAnnual: annualFromMonthly(479), label: "GMAT" },
  "gre-quant": {
    priceMonthly: 379,
    priceAnnual: annualFromMonthly(379),
    label: "GRE Quantitative",
  },
  "gre-verbal": {
    priceMonthly: 379,
    priceAnnual: annualFromMonthly(379),
    label: "GRE Verbal",
  },
  "gre-analytical-writing": {
    priceMonthly: 299,
    priceAnnual: annualFromMonthly(299),
    label: "GRE Analytical Writing",
  },
  "mcat-bb": {
    priceMonthly: 499,
    priceAnnual: annualFromMonthly(499),
    label: "MCAT Bio/Biochem",
  },
  "mcat-cp": {
    priceMonthly: 499,
    priceAnnual: annualFromMonthly(499),
    label: "MCAT Chem/Phys",
  },
  "mcat-ps": {
    priceMonthly: 499,
    priceAnnual: annualFromMonthly(499),
    label: "MCAT Psych/Soc",
  },
  "mcat-cars": {
    priceMonthly: 499,
    priceAnnual: annualFromMonthly(499),
    label: "MCAT CARS",
  },
  "med-mmi": {
    priceMonthly: 549,
    priceAnnual: annualFromMonthly(549),
    label: "Medical School MMI",
  },
  dat: { priceMonthly: 399, priceAnnual: annualFromMonthly(399), label: "DAT" },
  oat: { priceMonthly: 399, priceAnnual: annualFromMonthly(399), label: "OAT" },
  pcat: { priceMonthly: 349, priceAnnual: annualFromMonthly(349), label: "PCAT" },
  "usmle-step1": {
    priceMonthly: 799,
    priceAnnual: annualFromMonthly(799),
    label: "USMLE Step 1",
  },
  "usmle-step2-ck": {
    priceMonthly: 799,
    priceAnnual: annualFromMonthly(799),
    label: "USMLE Step 2 CK",
  },
  "usmle-step3": {
    priceMonthly: 649,
    priceAnnual: annualFromMonthly(649),
    label: "USMLE Step 3",
  },
  "comlex-level1": {
    priceMonthly: 699,
    priceAnnual: annualFromMonthly(699),
    label: "COMLEX Level 1",
  },
  "comlex-level2": {
    priceMonthly: 699,
    priceAnnual: annualFromMonthly(699),
    label: "COMLEX Level 2",
  },
  pance: { priceMonthly: 549, priceAnnual: annualFromMonthly(549), label: "PANCE" },
  naplex: { priceMonthly: 549, priceAnnual: annualFromMonthly(549), label: "NAPLEX" },
  inbde: { priceMonthly: 449, priceAnnual: annualFromMonthly(449), label: "INBDE" },
  "nclex-rn": {
    priceMonthly: 379,
    priceAnnual: annualFromMonthly(379),
    label: "NCLEX-RN",
  },
  "nclex-pn": {
    priceMonthly: 299,
    priceAnnual: annualFromMonthly(299),
    label: "NCLEX-PN",
  },
  "ati-teas": {
    priceMonthly: 279,
    priceAnnual: annualFromMonthly(279),
    label: "ATI TEAS",
  },
  "hesi-a2": {
    priceMonthly: 279,
    priceAnnual: annualFromMonthly(279),
    label: "HESI A2",
  },
  "sat-math": {
    priceMonthly: 279,
    priceAnnual: annualFromMonthly(279),
    label: "SAT Math",
  },
  "sat-reading": {
    priceMonthly: 279,
    priceAnnual: annualFromMonthly(279),
    label: "SAT Reading",
  },
  "act-math": {
    priceMonthly: 249,
    priceAnnual: annualFromMonthly(249),
    label: "ACT Math",
  },
  "act-english": {
    priceMonthly: 249,
    priceAnnual: annualFromMonthly(249),
    label: "ACT English",
  },
  "act-science": {
    priceMonthly: 249,
    priceAnnual: annualFromMonthly(249),
    label: "ACT Science",
  },
  "cfa-level1": {
    priceMonthly: 449,
    priceAnnual: annualFromMonthly(449),
    label: "CFA Level I",
  },
  "cpa-far": {
    priceMonthly: 449,
    priceAnnual: annualFromMonthly(449),
    label: "CPA FAR",
  },
  "bar-exam-mbe": {
    priceMonthly: 599,
    priceAnnual: annualFromMonthly(599),
    label: "Bar Exam MBE",
  },
};

export const PREMIUM_TRACK_LIST = Object.entries(PREMIUM_TRACK_PRICES).map(
  ([id, p]) => ({ id, ...p })
);

const PREMIUM_TRACK_ALIASES: Record<string, string> = {
  "pro-usmle-step1": "usmle-step1",
};

export function isPremiumTrack(trackId: string): boolean {
  const id = PREMIUM_TRACK_ALIASES[trackId] ?? trackId;
  return id in PREMIUM_TRACK_PRICES;
}

export function trackPrice(
  trackId: string,
  interval: BillingInterval
): number {
  const id = PREMIUM_TRACK_ALIASES[trackId] ?? trackId;
  const p =
    PREMIUM_TRACK_PRICES[id] ??
    PEAK_STANDARD_TRACK;
  return interval === "monthly" ? p.priceMonthly : p.priceAnnual;
}

/** Membership + any track (peak standard or exam override). */
export function totalWithTrack(
  trackId: string,
  interval: BillingInterval
): number {
  return (
    priceForInterval(
      PRICING.membership.priceMonthly,
      PRICING.membership.priceAnnual,
      interval
    ) + trackPrice(trackId, interval)
  );
}

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
    priceMonthly: 99,
    priceAnnual: annualFromMonthly(99),
    features: [
      "Required seat for any paid curriculum or track",
      "Cloud sync across devices",
      "Unlimited AI sessions on unlocked tracks",
      "Study Notebook — upload notes, Q&A, quiz me",
      "Priority human tutor matching",
    ],
  },
  track: {
    name: "Single course",
    priceMonthly: PEAK_STANDARD_TRACK.priceMonthly,
    priceAnnual: PEAK_STANDARD_TRACK.priceAnnual,
    features: [
      "One full study track end-to-end",
      "Peak library content + AI tutor on that track",
      "Upgrade to a library or bundle anytime",
    ],
  },
  bundle: {
    name: "All-in-one",
    priceMonthly: 1499,
    priceAnnual: annualFromMonthly(1499),
    features: [
      "Membership + every curriculum library",
      "All 400+ current & future tracks in catalog",
      "Best value vs buying libraries separately",
      "Priority new-course access at launch",
    ],
  },
  pro: {
    name: "sch00l Pro",
    priceMonthly: 1499,
    priceAnnual: annualFromMonthly(1499),
    features: [
      "Membership + all curriculum libraries",
      "Unlimited AI tutor sessions",
      "Study Notebook + full course libraries",
      "Cloud sync across devices",
    ],
  },
  humanTutor: {
    name: "Human tutor",
    studentRatePerHour: 145,
    rateFrom: 95,
    rateTo: 275,
    platformFeePerHour: 0,
    tutorPayoutPerHour: 0,
    features: [
      "Market rates — typically $95–$275/hr by subject",
      "You pick budget tier; tutors bid in range",
      "AI session summary included — no repeating yourself",
      "Pay only after you approve a match",
    ],
  },
  school: {
    name: "School / classroom",
    pricePerStudentMonth: 59,
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
    priceMonthly: 449,
    priceAnnual: annualFromMonthly(449),
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
