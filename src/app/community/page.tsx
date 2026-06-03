"use client";

import Link from "next/link";
import {
  MessageSquare,
  Zap,
  BookOpen,
  Upload,
  Users,
  Sparkles,
  Globe,
  Target,
} from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    title: "Learning lift",
    desc: "Only sch00l measures pre→post quiz gain per session — proof you learned, not copied.",
    href: "/outcomes",
    exclusive: true,
  },
  {
    icon: MessageSquare,
    title: "Class discussion",
    desc: "Piazza-style threads per class + teacher lounge. AI moderation built in.",
    href: "/my-classes",
  },
  {
    icon: Zap,
    title: "Live quiz battles",
    desc: "Kahoot-style rooms tied to your unit — optional lift check after.",
    href: "/my-classes",
  },
  {
    icon: BookOpen,
    title: "Practice tests",
    desc: "SAT, ACT, AP, IB, JEE, NEET, Gaokao, MCAT, GMAT — timed with weak-skill routing.",
    href: "/practice",
  },
  {
    icon: Upload,
    title: "Teacher materials → AI",
    desc: "Upload PDFs; tutor uses your class content (not generic ChatGPT).",
    href: "/teacher",
  },
  {
    icon: Users,
    title: "Import any LMS",
    desc: "Google Classroom, Canvas, Schoology, Teams, Moodle, Clever, and more.",
    href: "/integrations",
  },
  {
    icon: Globe,
    title: "127+ global curricula",
    desc: "IGCSE, A-Level, Gaokao, ENEM, USMLE — not just US AP.",
    href: "/study",
  },
  {
    icon: Sparkles,
    title: "Lift Battles™",
    desc: "Exclusive: live game + verified learning lift in one flow (coming soon on all tracks).",
    href: "/exclusive",
    exclusive: true,
  },
];

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Community & features</h1>
      <p className="mt-2 text-zinc-400 max-w-2xl">
        Discussion, battles, and class tools live under{" "}
        <strong className="text-zinc-300">My classes</strong> after you join with
        your teacher&apos;s code. Teachers manage everything from the class
        dashboard tabs.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/my-classes"
          className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-400"
        >
          My classes & discussion
        </Link>
        <Link
          href="/join"
          className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
        >
          Join with code
        </Link>
        <Link
          href="/teacher"
          className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
        >
          Teacher portal
        </Link>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-brand-400/30 transition group"
          >
            <f.icon className="h-6 w-6 text-brand-400 mb-2" />
            {f.exclusive && (
              <span className="text-[10px] uppercase tracking-wide text-brand-300 font-semibold">
                sch00l exclusive
              </span>
            )}
            <h2 className="text-lg font-semibold text-white group-hover:text-brand-200">
              {f.title}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
