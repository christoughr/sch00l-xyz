import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

const steps = [
  {
    title: "Supabase live",
    body: "Accounts + cloud progress enabled (see YOU-DO.md).",
  },
  {
    title: "Add your email to TEACHER_EMAILS",
    body: "Vercel env → redeploy → open /teacher.",
  },
  {
    title: "Create one classroom",
    body: "Copy the 6-character join code.",
  },
  {
    title: "Invite 15–30 students",
    body: "Share code + https://sch00l.ai/join",
  },
  {
    title: "Run one 2-week unit",
    body: "Same topic for everyone — measure class-wide lift.",
  },
  {
    title: "Export outcomes",
    body: "Screenshot /outcomes + classroom stats for your pitch deck.",
  },
];

export function TeacherPilotGuide() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">School pilot checklist</h2>
      <p className="text-sm text-zinc-400">
        One classroom, one unit, measurable lift — that&apos;s the story acquirers
        and schools buy.
      </p>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-3 text-sm">
            <Circle className="h-4 w-4 shrink-0 text-zinc-600 mt-0.5" />
            <div>
              <p className="text-zinc-200">
                {i + 1}. {s.title}
              </p>
              <p className="text-zinc-500">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/outcomes"
          className="inline-flex items-center gap-1 text-sm text-brand-400 hover:underline"
        >
          <CheckCircle2 className="h-4 w-4" />
          Public outcomes page
        </Link>
        <Link href="/study" className="text-sm text-zinc-400 hover:text-white">
          Student demo →
        </Link>
      </div>
    </div>
  );
}
