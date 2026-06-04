import Link from "next/link";
import { Sparkles, TrendingUp, Shield, Brain } from "lucide-react";
import { ExclusiveBattleCta } from "./ExclusiveBattleCta";

const EXCLUSIVE = [
  {
    title: "Measured learning lift",
    body: "Every session: pre-quiz → Socratic AI → post-quiz. Class dashboards show aggregate lift — data schools can show parents and admins.",
    icon: TrendingUp,
  },
  {
    title: "Anti-shortcut tutor",
    body: "AI refuses to do homework for you on first ask. Competitors sell answers; we sell understanding.",
    icon: Shield,
  },
  {
    title: "Session memory handoff",
    body: "Human tutors receive AI summaries of where you struggled — no repeating your story from scratch.",
    icon: Brain,
  },
  {
    title: "Teacher-owned document Q&A",
    body: "Generic answer sites are student-upload free-for-alls. Your teacher's PDFs power class-scoped, moderated help.",
    icon: Sparkles,
  },
  {
    title: "Marketplace tutor matching",
    body: "Students set budget tier; tutors compete in range — not one fixed hourly price.",
    icon: Sparkles,
  },
  {
    title: "Lift Battles™ (beta)",
    body: "Live quiz games that can end with a 3-question lift check — engagement plus proof.",
    icon: Sparkles,
  },
];

export default function ExclusivePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs uppercase tracking-wide text-brand-400 font-semibold mb-2">
        Only on sch00l.ai
      </p>
      <h1 className="text-3xl font-bold text-white">Exclusive features</h1>
      <p className="mt-3 text-zinc-400">
        Concepts we combine that test-prep sites and generic AI chat cannot copy
        in one product.
      </p>
      <ul className="mt-10 space-y-6">
        {EXCLUSIVE.map((item) => (
          <li
            key={item.title}
            className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <item.icon className="h-8 w-8 text-brand-400 shrink-0" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">{item.title}</h2>
              <p className="text-sm text-zinc-400 mt-1">{item.body}</p>
              {item.title.includes("Lift Battles") && <ExclusiveBattleCta />}
            </div>
          </li>
        ))}
      </ul>
      <Link
        href="/study"
        className="mt-10 inline-block rounded-xl bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-400"
      >
        Start a lift session
      </Link>
    </div>
  );
}
