"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import {
  PLATFORM_FEE,
  PRICING,
  SELLABLE_CURRICULA,
  CURRICULUM_PRICES,
  PREMIUM_TRACK_LIST,
  type BillingInterval,
  alaCarteTotal,
  annualSavingsPercent,
  billingPeriodLabel,
  bundleSavings,
  bundleSavingsPercent,
  formatUsd,
  freeSessionsShortLabel,
  monthlyEquivalent,
  priceForInterval,
  totalWithMembership,
  totalWithTrack,
} from "@/lib/pricing";
import { trackEvent } from "@/lib/analytics";
import { useEffect, useState } from "react";
import { PaymentButton } from "@/components/PaymentButton";
import { WaitlistForm } from "@/components/WaitlistForm";

function IntervalToggle({
  interval,
  onChange,
}: {
  interval: BillingInterval;
  onChange: (v: BillingInterval) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
      <button
        type="button"
        onClick={() => onChange("monthly")}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          interval === "monthly"
            ? "bg-brand-500 text-white"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange("annual")}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          interval === "annual"
            ? "bg-brand-500 text-white"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        Annual
        <span className="ml-1.5 text-xs opacity-80">save more</span>
      </button>
    </div>
  );
}

function PriceBlock({
  monthly,
  annual,
  interval,
}: {
  monthly: number;
  annual: number;
  interval: BillingInterval;
}) {
  const price = priceForInterval(monthly, annual, interval);
  const savings = annualSavingsPercent(monthly, annual);
  return (
    <div>
      <p className="text-3xl font-bold text-white">
        {formatUsd(price)}
        <span className="text-sm font-normal text-zinc-400">
          {billingPeriodLabel(interval)}
        </span>
      </p>
      {interval === "annual" && savings > 0 && (
        <p className="mt-1 text-xs text-brand-300">
          {formatUsd(monthlyEquivalent(annual))}/mo · {savings}% off monthly
        </p>
      )}
    </div>
  );
}

function PlanCard({
  name,
  subtitle,
  highlight,
  features,
  children,
  priceSlot,
}: {
  name: string;
  subtitle?: string;
  highlight?: boolean;
  features: readonly string[];
  children: React.ReactNode;
  priceSlot: React.ReactNode;
}) {
  return (
    <article
      className={`rounded-2xl border p-6 flex flex-col ${
        highlight
          ? "border-brand-400/50 bg-brand-500/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <h2 className="text-lg font-semibold text-white">{name}</h2>
      {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
      <div className="mt-3">{priceSlot}</div>
      <ul className="mt-6 space-y-2 flex-1">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-zinc-300">
            <Check className="h-4 w-4 shrink-0 text-brand-400 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      {children}
    </article>
  );
}

export default function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>("annual");
  const [proReady, setProReady] = useState(false);
  const [tutorReady, setTutorReady] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    trackEvent("upgrade_view", { page: "pricing" });
    fetch("/api/payments/config")
      .then((r) => r.json())
      .then((d) => {
        setProReady(!!d.proReady);
        setTutorReady(!!d.tutorReady);
        setConfigLoaded(true);
      })
      .catch(() => {
        setProReady(false);
        setTutorReady(false);
        setConfigLoaded(true);
      });
  }, []);

  const human = PRICING.humanTutor;
  const membership = PRICING.membership;
  const track = PRICING.track;
  const bundle = PRICING.bundle;
  const curriculumRange = SELLABLE_CURRICULA.reduce(
    (acc, c) => ({
      minM: Math.min(acc.minM, c.priceMonthly),
      maxM: Math.max(acc.maxM, c.priceMonthly),
      minA: Math.min(acc.minA, c.priceAnnual),
      maxA: Math.max(acc.maxA, c.priceAnnual),
    }),
    { minM: Infinity, maxM: 0, minA: Infinity, maxA: 0 }
  );

  const btnClass = (highlight?: boolean) =>
    `mt-6 block text-center rounded-xl py-3 text-sm font-medium ${
      highlight
        ? "bg-brand-500 text-white hover:bg-brand-400"
        : "border border-white/15 text-zinc-300 hover:bg-white/5"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 w-full overflow-x-hidden">
      <div className="mb-10 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs text-brand-300 mb-4">
          <Sparkles className="h-3 w-3" />
          Billing opening soon — study free meanwhile
        </p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Pricing</h1>
        <p className="mt-3 text-zinc-400 max-w-2xl mx-auto">
          Premium libraries, AI tutor, and full exam prep — priced for outcomes
          that pay for themselves (law, medicine, grad school, AP, and more).
        </p>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 max-w-xl mx-auto text-sm text-zinc-400">
          <strong className="text-zinc-200">Example:</strong> LSAT only ={" "}
          {formatUsd(membership.priceMonthly)} membership +{" "}
          {formatUsd(PREMIUM_TRACK_LIST.find((t) => t.id === "lsat")?.priceMonthly ?? 699)}{" "}
          LSAT track ={" "}
          <strong className="text-white">
            {formatUsd(totalWithTrack("lsat", "monthly"))}/mo
          </strong>
        </div>
        <div className="mt-6">
          <IntervalToggle interval={interval} onChange={setInterval} />
        </div>
        {configLoaded && !proReady && !tutorReady && (
          <p className="mt-4 text-sm text-amber-200/90 max-w-md mx-auto">
            Card checkout is not live yet — join the waitlist below. We&apos;ll
            email when billing is connected.
          </p>
        )}
      </div>

      {/* Step 1: Membership */}
      <section className="mb-12">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-4">
          1 · Platform membership (required)
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <PlanCard
            name={membership.name}
            subtitle="Every paid plan starts here — your seat on sch00l"
            features={membership.features}
            priceSlot={
              <PriceBlock
                monthly={membership.priceMonthly}
                annual={membership.priceAnnual}
                interval={interval}
              />
            }
          >
            <Link href="/#waitlist" className={btnClass()}>
              Join membership waitlist
            </Link>
          </PlanCard>
          <PlanCard
            name={PRICING.free.name}
            subtitle="Try before you buy"
            features={PRICING.free.features}
            priceSlot={
              <p className="text-3xl font-bold text-white">{formatUsd(0)}</p>
            }
          >
            <Link href="/study" className={btnClass()}>
              Start free
            </Link>
          </PlanCard>
        </div>
      </section>

      {/* Step 2: Per curriculum */}
      <section className="mb-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
              2 · Curriculum libraries
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {formatUsd(
                priceForInterval(
                  curriculumRange.minM,
                  curriculumRange.minA,
                  interval
                )
              )}
              –
              {formatUsd(
                priceForInterval(
                  curriculumRange.maxM,
                  curriculumRange.maxA,
                  interval
                )
              )}
              {billingPeriodLabel(interval)} per library · membership required
            </p>
          </div>
          <p className="text-xs text-zinc-500">
            Or {formatUsd(priceForInterval(track.priceMonthly, track.priceAnnual, interval))}
            {billingPeriodLabel(interval)} for a single course
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SELLABLE_CURRICULA.map((c) => (
            <article
              key={c.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col"
            >
              <h3 className="font-medium text-white">{c.label}</h3>
              <p className="mt-1 text-xs text-zinc-500 flex-1">{c.blurb}</p>
              <p className="mt-3 text-lg font-semibold text-white">
                {formatUsd(
                  priceForInterval(c.priceMonthly, c.priceAnnual, interval)
                )}
                <span className="text-xs font-normal text-zinc-400">
                  {billingPeriodLabel(interval)} library
                </span>
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                + {formatUsd(priceForInterval(membership.priceMonthly, membership.priceAnnual, interval))} membership ={" "}
                {formatUsd(totalWithMembership(c.priceMonthly, c.priceAnnual, interval))}
                {billingPeriodLabel(interval)} total
              </p>
              <Link
                href="/#waitlist"
                className="mt-3 block text-center rounded-lg border border-white/15 py-2 text-xs text-zinc-300 hover:bg-white/5"
              >
                Join waitlist
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Premium single tracks — high-stakes exams */}
      <section className="mb-12">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-2">
          Peak exam tracks
        </h2>
        <p className="text-sm text-zinc-400 mb-4 max-w-2xl">
          High-stakes exams priced for career ROI. Standard tracks from{" "}
          {formatUsd(track.priceMonthly)}/mo · membership required (
          {formatUsd(priceForInterval(membership.priceMonthly, membership.priceAnnual, interval))}
          {billingPeriodLabel(interval)}).
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PREMIUM_TRACK_LIST.map((t) => (
            <article
              key={t.id}
              className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4"
            >
              <h3 className="font-medium text-white">{t.label}</h3>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatUsd(
                  priceForInterval(t.priceMonthly, t.priceAnnual, interval)
                )}
                <span className="text-xs font-normal text-zinc-400">
                  {billingPeriodLabel(interval)} track
                </span>
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Total with membership:{" "}
                {formatUsd(totalWithTrack(t.id, interval))}
                {billingPeriodLabel(interval)}
              </p>
              <Link
                href="/#waitlist"
                className="mt-3 block text-center rounded-lg border border-brand-400/30 py-2 text-xs text-brand-300 hover:bg-brand-500/10"
              >
                Join waitlist
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Step 3: Bundle */}
      <section className="mb-12">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-4">
          3 · All-in-one bundle
        </h2>
        <PlanCard
          name={bundle.name}
          subtitle={`Membership + all ${SELLABLE_CURRICULA.length} curriculum libraries`}
          highlight
          features={[
            ...bundle.features,
            `Save ${formatUsd(bundleSavings(interval))} (${bundleSavingsPercent(interval)}%) vs à la carte ${formatUsd(alaCarteTotal(interval))}${billingPeriodLabel(interval)}`,
          ]}
          priceSlot={
            <PriceBlock
              monthly={bundle.priceMonthly}
              annual={bundle.priceAnnual}
              interval={interval}
            />
          }
        >
          {proReady ? (
            <PaymentButton
              plan="pro"
              label={`Subscribe — ${formatUsd(priceForInterval(bundle.priceMonthly, bundle.priceAnnual, interval))}${billingPeriodLabel(interval)}`}
              highlight
              fallbackHref="/#waitlist"
              fallbackLabel="Join waitlist instead"
            />
          ) : (
            <Link href="/#waitlist" className={btnClass(true)}>
              Join bundle waitlist
            </Link>
          )}
        </PlanCard>
      </section>

      {/* Add-ons */}
      <section className="mb-12">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-4">
          Add-ons
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <PlanCard
            name={human.name}
            features={[
              ...human.features,
              `${PLATFORM_FEE.humanTutorPercent}% platform fee — tutors keep the rest`,
            ]}
            priceSlot={
              <p className="text-3xl font-bold text-white">
                {formatUsd(human.rateFrom)}–{formatUsd(human.rateTo)}
                <span className="text-sm font-normal text-zinc-400">/hr</span>
              </p>
            }
          >
            {tutorReady ? (
              <PaymentButton
                plan="tutor_hour"
                label="Book 1 hour"
                fallbackHref="/tutors"
                fallbackLabel="Request tutor instead"
              />
            ) : (
              <Link href="/tutors" className={btnClass()}>
                Request human tutor
              </Link>
            )}
          </PlanCard>
          <PlanCard
            name={PRICING.school.name}
            features={[
              ...PRICING.school.features,
              `Min ${PRICING.school.minimumSeats} seats`,
            ]}
            priceSlot={
              <p className="text-3xl font-bold text-white">
                {formatUsd(PRICING.school.pricePerStudentMonth)}
                <span className="text-sm font-normal text-zinc-400">
                  /student/mo
                </span>
              </p>
            }
          >
            <Link href="/teacher" className={btnClass()}>
              Contact for pilot
            </Link>
          </PlanCard>
        </div>
      </section>

      {/* Family */}
      <section className="mb-12 grid gap-6 lg:grid-cols-2">
        <PlanCard
          name={PRICING.family.name}
          subtitle={`${PRICING.family.seats} student seats`}
          features={PRICING.family.features}
          priceSlot={
            <PriceBlock
              monthly={PRICING.family.priceMonthly}
              annual={PRICING.family.priceAnnual}
              interval={interval}
            />
          }
        >
          <Link href="/#waitlist" className={btnClass()}>
            Join waitlist
          </Link>
        </PlanCard>
        <PlanCard
          name="Billing policy"
          subtitle="All paid plans"
          features={[
            "All sales final — no free trial",
            "No refunds on subscriptions or curriculum libraries",
            "Cancel anytime — access through the current billing period",
            "Human tutor sessions non-refundable once completed",
          ]}
          priceSlot={
            <p className="text-lg font-semibold text-zinc-300">
              Paid at checkout
            </p>
          }
        >
          <Link href="/refund" className={btnClass()}>
            Read billing policy
          </Link>
        </PlanCard>
      </section>

      {!proReady && configLoaded && (
        <section
          id="waitlist"
          className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-8 mb-12 scroll-mt-24"
        >
          <h2 className="text-lg font-semibold text-white">Join the waitlist</h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-lg">
            Checkout isn&apos;t live yet. Get notified when membership,
            curricula, and bundle billing open.
          </p>
          <div className="mt-6">
            <WaitlistForm source="pricing" />
          </div>
        </section>
      )}

      <details className="rounded-2xl border border-white/10 bg-white/5 p-8 group">
        <summary className="cursor-pointer text-lg font-semibold text-white list-none flex items-center justify-between">
          How pricing works
          <span className="text-zinc-500 text-sm group-open:rotate-180 transition">
            ▾
          </span>
        </summary>
        <ul className="mt-4 space-y-3 text-sm text-zinc-400 max-w-2xl">
          <li>
            <strong className="text-zinc-200">Free:</strong>{" "}
            {freeSessionsShortLabel()} on any track preview.
          </li>
          <li>
            <strong className="text-zinc-200">Membership:</strong>{" "}
            {formatUsd(membership.priceMonthly)}/mo or{" "}
            {formatUsd(membership.priceAnnual)}/yr — required seat before any
            paid curriculum.
          </li>
          <li>
            <strong className="text-zinc-200">Curriculum library:</strong>{" "}
            {formatUsd(curriculumRange.minM)}–{formatUsd(curriculumRange.maxM)}/mo
            or {formatUsd(curriculumRange.minA)}–{formatUsd(curriculumRange.maxA)}
            /yr per area — each curriculum priced separately.
          </li>
          <li>
            <strong className="text-zinc-200">Single course:</strong>{" "}
            {formatUsd(track.priceMonthly)}/mo or {formatUsd(track.priceAnnual)}
            /yr for one track (e.g. Calc I, AP Physics).
          </li>
          <li>
            <strong className="text-zinc-200">All-in-one:</strong>{" "}
            {formatUsd(bundle.priceMonthly)}/mo or {formatUsd(bundle.priceAnnual)}
            /yr — membership + every library ({bundleSavingsPercent("annual")}%
            off à la carte annually).
          </li>
          <li>
            <strong className="text-zinc-200">Human tutor:</strong> Market ranges{" "}
            {formatUsd(human.rateFrom)}–{formatUsd(human.rateTo)}/hr —{" "}
            {PLATFORM_FEE.humanTutorPercent}% platform fee.
          </li>
        </ul>
      </details>
    </div>
  );
}
