import Link from "next/link";
import {
  Brain,
  Shield,
  BarChart3,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { WaitlistForm } from "@/components/WaitlistForm";
import { LEGACY_DOMAIN, SITE_DOMAIN } from "@/lib/site";

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
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-0 glow-orb pointer-events-none" />

      <section className="relative mx-auto max-w-6xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28">
        <p className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs text-brand-300 mb-6">
          {SITE_DOMAIN} — AI built for students who actually study
        </p>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl leading-[1.1]">
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
            href="/progress"
            className="inline-flex items-center rounded-xl border border-white/15 px-6 py-3 text-zinc-300 transition hover:bg-white/5"
          >
            View progress
          </Link>
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          Works in demo mode today. Add an API key for full AI — Groq has a free
          tier.
        </p>

        <div className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-8">
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
          Why this matters for acquisition
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
            The play: become undeniable
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-400 leading-relaxed">
            Khan Academy, Duolingo, Chegg, and Pearson don&apos;t buy chatbots —
            they buy{" "}
            <strong className="text-zinc-200">distribution + pedagogy + data</strong>.
            sch00l ships all three from day one: integrity-first tutoring, student
            engagement loops, and a mastery layer competitors can plug into.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-sm text-zinc-400">
            <li>→ 10k weekly active studiers with 15+ min avg session</li>
            <li>→ Published learning outcomes (pre/post quiz lift)</li>
            <li>→ School pilot or .edu email waitlist</li>
            <li>→ Clean codebase + API — easy diligence</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
