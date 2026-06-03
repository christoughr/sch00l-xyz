"use client";

import Link from "next/link";
import { useState } from "react";
import { Bot, UserRound, ArrowRight } from "lucide-react";
import { TutorRequestForm } from "@/components/TutorRequestForm";
import { TutorApplyForm } from "@/components/TutorApplyForm";
import { SubjectPicker } from "@/components/SubjectPicker";
import { TutorPricingBanner } from "@/components/TutorPricingBanner";
import {
  tutorRateRange,
  formatRateFrom,
  COMPETITIVE_NOTE,
  type TutorBudgetTier,
} from "@/lib/tutor-pricing";
import type { SubjectId } from "@/lib/types";

export default function TutorsPage() {
  const [subject, setSubject] = useState<SubjectId>("math");
  const [budgetTier, setBudgetTier] = useState<TutorBudgetTier>("standard");
  const range = tutorRateRange(subject, budgetTier);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">AI + human tutors</h1>
        <p className="mt-2 text-zinc-400 max-w-2xl">
          Start free with Socratic AI. When you need a person, request a match —
          tutors compete inside your budget band. {COMPETITIVE_NOTE}
        </p>
        <p className="mt-3 text-sm text-brand-300">
          {formatRateFrom(range)} for {subject} · platform fee only{" "}
          {18}% (lower than typical marketplaces)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-12">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <Bot className="h-8 w-8 text-brand-400 mb-3" />
          <h2 className="text-lg font-semibold text-white">Step 1 — AI tutor</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Free daily sessions. Pre-quiz → chat → post-quiz measures lift.
          </p>
          <Link
            href="/study"
            className="mt-4 inline-flex items-center gap-1 text-sm text-brand-400 hover:underline"
          >
            Start studying <ArrowRight className="h-3 w-3" />
          </Link>
        </article>
        <article className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-6">
          <UserRound className="h-8 w-8 text-brand-400 mb-3" />
          <h2 className="text-lg font-semibold text-white">Step 2 — Human tutor</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Market rates by subject — you pick budget tier; we match 2–3 tutors in
            range. Pay only after you approve.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-block text-sm text-brand-400 hover:underline"
          >
            Compare plans →
          </Link>
        </article>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 mb-12">
        <h2 className="text-xl font-semibold text-white">Request a human tutor</h2>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
          AI got you started — a human can go deeper. We attach your session
          summary (topic, stuck points, quiz scores).
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-4 min-w-0">
            <p className="text-sm font-medium text-zinc-300">Subject</p>
            <SubjectPicker value={subject} onChange={setSubject} />
          </div>

          <div className="space-y-4 min-w-0">
            <p className="text-sm font-medium text-zinc-300">Budget preference</p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["budget", "Budget"],
                  ["standard", "Standard"],
                  ["premium", "Expert"],
                  ["urgent", "Rush <48h"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setBudgetTier(id)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    budgetTier === id
                      ? "border-brand-400 bg-brand-500/15 text-brand-200"
                      : "border-white/10 text-zinc-400 hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <TutorPricingBanner subject={subject} tier={budgetTier} />
            <TutorRequestForm
              subject={subject}
              budgetTier={budgetTier}
              rateRange={range}
            />
          </div>
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          Best with session context — request from a{" "}
          <Link href="/study" className="text-brand-400 underline">
            study session
          </Link>
          .
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white mb-2">
          Become a partner tutor
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Set your own hourly rate inside market bands. Students choose budget
          tier; you keep ~82% after platform fee.
        </p>
        <TutorApplyForm />
      </section>
    </div>
  );
}
