"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { PLATFORM_FEE, PRICING, formatUsd } from "@/lib/pricing";
import { trackEvent } from "@/lib/analytics";
import { useEffect, useState } from "react";
import { CheckoutButton } from "@/components/CheckoutButton";

function PlanCard({
  name,
  price,
  period,
  highlight,
  features,
  children,
}: {
  name: string;
  price: string;
  period?: string;
  highlight?: boolean;
  features: readonly string[];
  children: React.ReactNode;
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
      <p className="mt-2 text-3xl font-bold text-white">
        {price}
        {period && (
          <span className="text-sm font-normal text-zinc-400">{period}</span>
        )}
      </p>
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
  const [stripeReady, setStripeReady] = useState(false);

  useEffect(() => {
    trackEvent("upgrade_view", { page: "pricing" });
    fetch("/api/stripe/config")
      .then((r) => r.json())
      .then((d) => setStripeReady(!!d.enabled && !!d.proPriceConfigured))
      .catch(() => setStripeReady(false));
  }, []);

  const human = PRICING.humanTutor;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-10 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs text-brand-300 mb-4">
          <Sparkles className="h-3 w-3" />
          AI free to start · we earn when you level up
        </p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Pricing</h1>
        <p className="mt-3 text-zinc-400 max-w-xl mx-auto">
          Start free with Socratic AI. Go Pro for unlimited sessions, or book a
          human tutor with your AI session summary included.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
        <PlanCard
          name={PRICING.free.name}
          price={formatUsd(0)}
          features={PRICING.free.features}
        >
          <Link
            href="/study"
            className="mt-6 block text-center rounded-xl py-3 text-sm font-medium border border-white/15 text-zinc-300 hover:bg-white/5"
          >
            Start free
          </Link>
        </PlanCard>
        <PlanCard
          name={PRICING.pro.name}
          price={formatUsd(PRICING.pro.priceMonthly)}
          period="/mo"
          highlight
          features={PRICING.pro.features}
        >
          <CheckoutButton
            plan="pro"
            label={stripeReady ? "Subscribe to Pro" : "Join Pro waitlist"}
            highlight
            fallbackHref="/#waitlist"
            fallbackLabel="Join waitlist instead"
          />
        </PlanCard>
        <PlanCard
          name={human.name}
          price={formatUsd(human.studentRatePerHour)}
          period="/hr"
          features={[
            ...human.features,
            `Tutors earn ${formatUsd(human.tutorPayoutPerHour)}/hr · platform ${PLATFORM_FEE.humanTutorPercent}%`,
          ]}
        >
          <CheckoutButton
            plan="tutor_hour"
            label="Book 1 hour"
            fallbackHref="/tutors"
            fallbackLabel="Request tutor instead"
          />
        </PlanCard>
        <PlanCard
          name={PRICING.school.name}
          price={formatUsd(PRICING.school.pricePerStudentMonth)}
          period="/student/mo"
          features={[
            ...PRICING.school.features,
            `Min ${PRICING.school.minimumSeats} seats`,
          ]}
        >
          <Link
            href="/teacher"
            className="mt-6 block text-center rounded-xl py-3 text-sm font-medium border border-white/15 text-zinc-300 hover:bg-white/5"
          >
            Contact for pilot
          </Link>
        </PlanCard>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-lg font-semibold text-white">How sch00l makes money</h2>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
          We keep the platform fee on human tutoring ({PLATFORM_FEE.humanTutorPercent}%
          of {formatUsd(human.studentRatePerHour)}/hr ={" "}
          {formatUsd(human.platformFeePerHour)} to sch00l per hour). Pro subscriptions
          and school seats are 100% platform revenue. AI free tier drives adoption;
          paid tiers drive outcomes.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm">
          <div className="rounded-xl border border-white/10 p-4">
            <p className="text-brand-300 font-medium">Pro</p>
            <p className="text-zinc-400 mt-1">
              {formatUsd(PRICING.pro.priceMonthly)}/mo unlimited AI
            </p>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <p className="text-brand-300 font-medium">Human tutor</p>
            <p className="text-zinc-400 mt-1">
              {formatUsd(human.platformFeePerHour)}/hr platform fee
            </p>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <p className="text-brand-300 font-medium">Schools</p>
            <p className="text-zinc-400 mt-1">
              {formatUsd(PRICING.school.pricePerStudentMonth)}/seat × {PRICING.school.minimumSeats}+
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
