import Link from "next/link";
import { PLATFORMS } from "@/lib/integrations";

export default function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-white mb-2">Integrations</h1>
      <p className="text-zinc-400 mb-8">
        Connect sch00l with your LMS or SIS. Per-classroom setup lives in your
        teacher dashboard.
      </p>

      <div className="rounded-xl border border-brand-400/20 bg-brand-500/5 p-5 mb-8">
        <p className="text-sm text-zinc-300">
          To connect Google Classroom, Canvas, Clever, or others, open a
          classroom and go to the{" "}
          <strong className="text-white">Integrations</strong> tab.
        </p>
        <Link
          href="/teacher"
          className="mt-4 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400"
        >
          Go to teacher portal →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PLATFORMS.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <h2 className="font-medium text-white">{p.label}</h2>
            <p className="mt-1 text-sm text-zinc-500">{p.description}</p>
            <p className="mt-2 text-xs text-zinc-600">
              {p.csv && "CSV import · "}
              {p.api ? "API" : p.csv ? "" : "Manual link"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
