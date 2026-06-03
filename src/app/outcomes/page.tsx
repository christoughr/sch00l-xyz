"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart2,
  TrendingUp,
  Users,
  Clock,
  Swords,
  ClipboardList,
  Shield,
} from "lucide-react";

type Aggregates = {
  uniqueLearners?: number;
  totalStudyMinutes?: number;
  quizAttempts?: number;
  averageLiftPercent?: number | null;
  liftSampleSize?: number;
  practiceAttemptsFinished?: number;
  averagePracticePercent?: number | null;
  liveBattlesCreated?: number;
  liveBattlesFinished?: number;
  plagiarismChecks?: number;
  plagiarismFlagged?: number;
  avgPlagiarismScore?: number | null;
  practiceTestCatalogSize?: number;
};

type OutcomesV2 = {
  mode: "anonymized" | "partial" | "demo";
  periodDays?: number;
  migrationRequired?: string;
  aggregates: Aggregates;
};

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <Icon className="h-5 w-5 text-brand-400 mb-3" />
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-sm text-zinc-400">{label}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function OutcomesPage() {
  const [data, setData] = useState<OutcomesV2 | null>(null);

  useEffect(() => {
    fetch("/api/outcomes/v2")
      .then((r) => r.json())
      .then(setData)
      .catch(() =>
        setData({
          mode: "demo",
          periodDays: 30,
          aggregates: {},
        })
      );
  }, []);

  const agg = data?.aggregates ?? {};
  const period = data?.periodDays ?? 30;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Learning outcomes</h1>
        <p className="mt-2 text-zinc-400 max-w-xl">
          sch00l measures what matters: pre-quiz → tutor → post-quiz{" "}
          <strong className="text-zinc-300">learning lift</strong>, not answer
          dumps.
        </p>
      </div>

      {!data ? (
        <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
      ) : (
        <div className="space-y-6">
          {data.migrationRequired && (
            <p className="text-sm text-amber-200/90 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              Partial data — run migration{" "}
              <code className="text-white">{data.migrationRequired}</code> for
              full aggregates.
            </p>
          )}

          <p className="text-sm text-zinc-500">
            Last {period} days · anonymous aggregate
            {data.mode === "partial" && " (partial)"}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              icon={Users}
              label="Unique learners"
              value={String(agg.uniqueLearners ?? 0)}
            />
            <Stat
              icon={Clock}
              label="Total study time"
              value={`${agg.totalStudyMinutes ?? 0} min`}
            />
            <Stat
              icon={BarChart2}
              label="Quiz attempts"
              value={String(agg.quizAttempts ?? 0)}
            />
            <Stat
              icon={TrendingUp}
              label="Avg learning lift"
              value={
                agg.averageLiftPercent != null
                  ? `${agg.averageLiftPercent >= 0 ? "+" : ""}${agg.averageLiftPercent}%`
                  : "—"
              }
              sub={
                agg.liftSampleSize
                  ? `n=${agg.liftSampleSize} pre/post pairs`
                  : undefined
              }
            />
            <Stat
              icon={ClipboardList}
              label="Practice tests finished"
              value={String(agg.practiceAttemptsFinished ?? 0)}
              sub={
                agg.averagePracticePercent != null
                  ? `avg ${agg.averagePracticePercent}%`
                  : undefined
              }
            />
            <Stat
              icon={Swords}
              label="Live battles"
              value={String(agg.liveBattlesCreated ?? 0)}
              sub={
                agg.liveBattlesFinished != null
                  ? `${agg.liveBattlesFinished} finished`
                  : undefined
              }
            />
            {(agg.plagiarismChecks ?? 0) > 0 && (
              <Stat
                icon={Shield}
                label="Plagiarism checks"
                value={String(agg.plagiarismChecks)}
                sub={
                  agg.plagiarismFlagged != null
                    ? `${agg.plagiarismFlagged} flagged`
                    : undefined
                }
              />
            )}
            {(agg.practiceTestCatalogSize ?? 0) > 0 && (
              <Stat
                icon={ClipboardList}
                label="Practice test catalog"
                value={String(agg.practiceTestCatalogSize)}
              />
            )}
          </div>
        </div>
      )}

      <section className="mt-12 rounded-2xl border border-brand-400/20 bg-brand-500/5 p-6">
        <h2 className="text-lg font-semibold text-white">How we measure lift</h2>
        <ol className="mt-4 space-y-2 text-sm text-zinc-400 list-decimal list-inside">
          <li>Pre-quiz baseline (3 questions on your topic)</li>
          <li>Socratic AI tutor session (no homework cheating)</li>
          <li>Post-quiz — same difficulty, new questions</li>
          <li>Lift = post % − pre % (shown on Progress)</li>
        </ol>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link href="/study" className="text-brand-400 hover:underline">
            Try a session →
          </Link>
          <Link href="/practice" className="text-brand-400 hover:underline">
            Practice tests →
          </Link>
        </div>
      </section>
    </div>
  );
}
