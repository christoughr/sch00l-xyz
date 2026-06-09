import Link from "next/link";
import {
  Brain,
  Shield,
  BarChart3,
  GraduationCap,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { WaitlistForm } from "@/components/WaitlistForm";
import { CopyShareLink } from "@/components/CopyShareLink";
import { DailyReviewBanner } from "@/components/DailyReviewBanner";
import { OutcomesTeaser } from "@/components/OutcomesTeaser";
import { LEGACY_DOMAIN, SITE_DOMAIN, SITE_URL } from "@/lib/site";
import { freeSessionsMarketingLabel } from "@/lib/pricing";

const features = [
  {
    icon: Brain,
    title: "Socratic AI tutor",
    body: "Hints and questions first — not answer dumps. The same pedagogy serious ed platforms care about.",
  },
  {
    icon: Shield,
    title: "Anti-cheat by design",
    body: "We refuse to do homework for students. That integrity is why schools and acquirers trust you.",
  },
  {
    icon: BarChart3,
    title: "Mastery & streak data",
    body: "Every session builds a learning graph: topics, confidence, time on task — acquisition-grade signal.",
  },
  {
    icon: GraduationCap,
    title: "Built for real students",
    body: "Math, science, essays, CS, languages — one focused study flow, not a generic chatbot.",
  },
  {
    icon: BookOpen,
    title: "Beyond SparkNotes",
    body: "Course-linked lessons, prep quizzes, and a Study Notebook — summaries you can actually ask follow-ups about.",
  },
];

export default function HomePage() {
  return (
    <div className="relative w-full max-w-[100vw] overflow-x-hidden">
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-0 glow-orb pointer-events-none" />

      <section className="relative mx-auto max-w-6xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28">
        <p className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs text-brand-300 mb-6">
          {SITE_DOMAIN} — AI built for students who actually study
        </p>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl leading-[1.1] break-words">
          AI that helps students{" "}
          <span className="text-brand-400">study</span>, not scroll.
        </h1>

        <p className="mt-6 max-w-xl text-lg text-zinc-400 leading-relaxed">
          sch00l is a student-first study partner: Socratic tutoring, progress
          streaks, and mastery tracking. Built with the same goal as the giants —
          real learning outcomes — at a fraction of the burn.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/study"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-medium text-white transition hover:bg-brand-400"
          >
            Start studying free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/notebook"
            className="inline-flex items-center rounded-xl border border-white/15 px-6 py-3 text-zinc-300 transition hover:bg-white/5"
          >
            Study Notebook
          </Link>
          <CopyShareLink url={`${SITE_URL}/study`} />
        </div>

        <OutcomesTeaser />

        <p className="mt-8 text-sm text-zinc-500">
          Free: {freeSessionsMarketingLabel()} · Pro & human tutors on{" "}
          <Link href="/pricing" className="text-brand-400 underline">
            pricing
          </Link>
        </p>

        <div className="mt-6 max-w-xl">
          <DailyReviewBanner />
        </div>

        <div id="waitlist" className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-xl font-semibold text-white">Join the waitlist</h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-md">
            Early access, classroom pilots, and launch updates for {SITE_DOMAIN}.
            <span className="block mt-1 text-zinc-500">
              {LEGACY_DOMAIN} also works — redirects here automatically.
            </span>
          </p>
          <div className="mt-6">
            <WaitlistForm />
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-8">
          Built for real learning
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <f.icon className="h-8 w-8 text-brand-400 mb-4" />
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                {f.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-8 lg:p-10">
          <h2 className="text-2xl font-bold text-white">AI + human tutors</h2>
          <p className="mt-3 max-w-2xl text-zinc-400 leading-relaxed">
            Start free with Socratic AI. Still stuck? Request a partner tutor —
            they get your session summary, quiz scores, and topic so nobody starts
            from zero.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/study"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-400"
            >
              Try AI tutor
            </Link>
            <Link
              href="/tutors"
              className="inline-flex items-center rounded-xl border border-white/15 px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
            >
              Human tutors →
            </Link>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-xl font-semibold text-white">Teachers & schools</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Classroom codes, roster dashboards, and class-wide learning lift —
              ready for pilots.
            </p>
            <Link
              href="/teacher"
              className="inline-block mt-4 text-brand-400 hover:underline text-sm"
            >
              Open teacher portal →
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-xl font-semibold text-white">Students</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Got a class code from your teacher? Join to sync your progress.
            </p>
            <Link
              href="/join"
              className="inline-block mt-4 text-brand-400 hover:underline text-sm"
            >
              Join a class →
            </Link>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/10 bg-surface-900/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold text-white">
            See your learning lift
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-400 leading-relaxed">
            Every session can measure pre-quiz → post-quiz improvement. Track
            streaks, topics, and flashcards — or book a human tutor when AI
            isn&apos;t enough.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-sm text-zinc-400">
            <li>→ Pre/post quiz on your topic</li>
            <li>→ Socratic AI — no homework cheating</li>
            <li>
              →{" "}
              <Link href="/outcomes" className="text-brand-400 hover:underline">
                Outcomes dashboard
              </Link>
            </li>
            <li>
              →{" "}
              <Link href="/pricing" className="text-brand-400 hover:underline">
                Pro & human tutor pricing
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
