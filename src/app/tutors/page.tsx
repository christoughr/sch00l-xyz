"use client";

import Link from "next/link";
import { useState } from "react";
import { Bot, UserRound, ArrowRight } from "lucide-react";
import { TutorRequestForm } from "@/components/TutorRequestForm";
import { TutorApplyForm } from "@/components/TutorApplyForm";
import { SubjectPicker } from "@/components/SubjectPicker";
import { formatUsd, PRICING } from "@/lib/pricing";
import type { SubjectId } from "@/lib/types";

export default function TutorsPage() {
  const [subject, setSubject] = useState<SubjectId>("math");
  const human = PRICING.humanTutor;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">AI + human tutors</h1>
        <p className="mt-2 text-zinc-400 max-w-xl">
          sch00l starts with Socratic AI (free tier: 3 sessions/day). When you
          need a person, book a vetted tutor — your AI session summary travels
          with the request.
        </p>
        <p className="mt-3 text-sm text-brand-300">
          Human tutoring: {formatUsd(human.studentRatePerHour)}/hr · sch00l
          platform coordinates matching
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
            {formatUsd(human.studentRatePerHour)}/hr · tutors earn{" "}
            {formatUsd(human.tutorPayoutPerHour)}/hr after platform fee.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-block text-sm text-brand-400 hover:underline"
          >
            Full pricing →
          </Link>
        </article>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">
          Request a human tutor
        </h2>
        <p className="text-sm text-zinc-400 mb-4">Subject for this request</p>
        <div className="mb-6 max-w-md">
          <SubjectPicker value={subject} onChange={setSubject} />
        </div>
        <TutorRequestForm subject={subject} />
        <p className="mt-4 text-xs text-zinc-500">
          Best with session context — request from a{" "}
          <Link href="/study" className="text-brand-400 underline">
            study session
          </Link>
          .
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-xl font-semibold text-white mb-2">
          Become a partner tutor
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          AP teachers, college tutors — students arrive with AI session context.
          Earn {formatUsd(human.tutorPayoutPerHour)}/hr on {formatUsd(human.studentRatePerHour)}/hr sessions.
        </p>
        <TutorApplyForm />
      </section>
    </div>
  );
}
