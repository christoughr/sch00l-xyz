"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { PLATFORM_FEE, PRICING, formatUsd } from "@/lib/pricing";
import { trackEvent } from "@/lib/analytics";
import { useEffect, useState } from "react";
import { PaymentButton } from "@/components/PaymentButton";

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
  const btnClass = (highlight?: boolean) =>
    `mt-6 block text-center rounded-xl py-3 text-sm font-medium ${
      highlight
        ? "bg-brand-500 text-white hover:bg-brand-400"
        : "border border-white/15 text-zinc-300 hover:bg-white/5"
    }`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-10 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs text-brand-300 mb-4">
          <Sparkles className="h-3 w-3" />
          AI free to start · Pro via Lemon Squeezy when live
        </p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Pricing</h1>
        <p className="mt-3 text-zinc-400 max-w-xl mx-auto">
          Start free with Socratic AI. Join the Pro waitlist for unlimited sessions,
          or request a human tutor with your AI session summary included.
        </p>
        {configLoaded && !proReady && !tutorReady && (
          <p className="mt-4 text-sm text-amber-200/90 max-w-md mx-auto">
            Card checkout is not live yet — use the waitlist below. We&apos;ll email
            when Lemon Squeezy is connected.
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-12">
        <PlanCard
          name={PRICING.free.name}
          price={formatUsd(0)}
          features={PRICING.free.features}
        >
          <Link href="/study" className={btnClass()}>
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
          {proReady ? (
            <PaymentButton
              plan="pro"
              label="Subscribe to Pro"
              highlight
              fallbackHref="/#waitlist"
              fallbackLabel="Join waitlist instead"
            />
          ) : (
            <Link href="/#waitlist" className={btnClass(true)}>
              Join Pro waitlist
            </Link>
          )}
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
          price={formatUsd(PRICING.school.pricePerStudentMonth)}
          period="/student/mo"
          features={[
            ...PRICING.school.features,
            `Min ${PRICING.school.minimumSeats} seats`,
          ]}
        >
          <Link href="/teacher" className={btnClass()}>
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
          and school seats are 100% platform revenue.
        </p>
      </section>
    </div>
  );
}
