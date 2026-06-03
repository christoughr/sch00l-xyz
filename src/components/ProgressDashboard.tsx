"use client";

import { useCallback, useEffect, useState } from "react";
import { Flame, Clock, BookOpen, TrendingUp, BarChart2 } from "lucide-react";
import { loadProgress, saveProgress } from "@/lib/progress";
import { getSubject } from "@/lib/subjects";
import type { StudentProgress } from "@/lib/types";
import { useAuth } from "./AuthProvider";

function StatCard({
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

export function ProgressDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [quizLift, setQuizLift] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (user) {
      const res = await fetch("/api/progress/sync");
      if (res.ok) {
        const data = await res.json();
        if (data.progress) {
          saveProgress(data.progress);
          setProgress(data.progress);
          return;
        }
      }
    }
    setProgress(loadProgress());
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    async function loadQuizzes() {
      if (!user) {
        const { latestQuizLiftLocal } = await import("@/lib/quiz-local");
        setQuizLift(latestQuizLiftLocal());
        return;
      }
      const supabase = (await import("@/lib/supabase/client")).createClient();
      if (!supabase) return;
      const { data } = await supabase
        .from("quiz_results")
        .select("phase, score, total, session_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(40);
      if (!data?.length) return;
      const sessionIds = [
        ...new Set(data.filter((q) => q.session_id).map((q) => q.session_id as string)),
      ];
      for (const sid of sessionIds) {
        const pre = data.find((q) => q.session_id === sid && q.phase === "pre");
        const post = data.find((q) => q.session_id === sid && q.phase === "post");
        if (pre && post) {
          const prePct = Math.round((pre.score / pre.total) * 100);
          const postPct = Math.round((post.score / post.total) * 100);
          setQuizLift(
            `${prePct}% → ${postPct}% (${postPct - prePct >= 0 ? "+" : ""}${postPct - prePct} lift)`
          );
          return;
        }
      }
    }
    loadQuizzes();
  }, [user]);

  if (!progress) {
    return <div className="animate-pulse h-48 rounded-2xl bg-white/5" />;
  }

  const recent = progress.sessions.slice(0, 8);

  return (
    <div className="space-y-8">
      {quizLift && (
        <div className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-4 flex items-center gap-3">
          <BarChart2 className="h-5 w-5 text-brand-400" />
          <div>
            <p className="text-sm font-medium text-white">Latest learning lift</p>
            <p className="text-sm text-brand-300">{quizLift}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Flame}
          label="Study streak"
          value={`${progress.streakDays} day${progress.streakDays === 1 ? "" : "s"}`}
          sub={progress.lastStudyDate ? `Last: ${progress.lastStudyDate}` : "Start today"}
        />
        <StatCard
          icon={Clock}
          label="Total study time"
          value={`${progress.totalMinutes} min`}
        />
        <StatCard
          icon={BookOpen}
          label="Sessions"
          value={String(progress.totalSessions)}
        />
        <StatCard
          icon={TrendingUp}
          label="Topics tracked"
          value={String(progress.mastery.length)}
          sub="Mastery data — your moat"
        />
      </div>

      {progress.mastery.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Mastery map</h2>
          <div className="space-y-2">
            {progress.mastery.map((m) => (
              <div
                key={`${m.subject}-${m.topic}`}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white">
                    {getSubject(m.subject).emoji} {m.topic}
                  </span>
                  <span className="text-zinc-400">{m.confidence}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-900 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${m.confidence}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Recent sessions</h2>
        {recent.length === 0 ? (
          <p className="text-zinc-400 text-sm">
            No sessions yet.{" "}
            <a href="/study" className="text-brand-400 hover:underline">
              Start studying
            </a>
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="text-white">
                  {getSubject(s.subject).label} · {s.messageCount} messages
                </span>
                <span className="text-zinc-500">
                  {s.minutesStudied} min ·{" "}
                  {new Date(s.startedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
