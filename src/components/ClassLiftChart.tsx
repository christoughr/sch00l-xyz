"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";

type StudentRow = {
  email: string;
  displayName?: string;
  totalMinutes: number;
  quizLift: number | null;
  summary?: { completionRate: number };
};

export function ClassLiftChart({ classroomId }: { classroomId: string }) {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/classrooms/${classroomId}/stats`).then((r) => r.json()),
      fetch(`/api/classrooms/${classroomId}/assignments/progress`).then((r) =>
        r.json()
      ),
    ])
      .then(([statsData, progressData]) => {
        const statsStudents: StudentRow[] = (statsData.students ?? []).map(
          (s: {
            email: string;
            displayName?: string;
            totalMinutes: number;
            quizLift: number | null;
          }) => ({
            email: s.email,
            displayName: s.displayName,
            totalMinutes: s.totalMinutes,
            quizLift: s.quizLift,
          })
        );

        const progressMap = new Map<
          string,
          { totalMinutes: number; completionRate: number }
        >();
        for (const p of progressData.progress ?? []) {
          progressMap.set(p.email, {
            totalMinutes: p.totalMinutes ?? 0,
            completionRate: p.summary?.completionRate ?? 0,
          });
        }

        const merged = statsStudents.map((s) => {
          const prog = progressMap.get(s.email);
          return {
            ...s,
            totalMinutes: Math.max(s.totalMinutes, prog?.totalMinutes ?? 0),
            summary: prog ? { completionRate: prog.completionRate } : undefined,
          };
        });

        setStudents(merged.sort((a, b) => b.totalMinutes - a.totalMinutes));
      })
      .finally(() => setLoading(false));
  }, [classroomId]);

  const maxMinutes = Math.max(1, ...students.map((s) => s.totalMinutes));
  const maxLift = Math.max(
    1,
    ...students.map((s) => Math.abs(s.quizLift ?? 0))
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-brand-400" />
        <h2 className="text-lg font-semibold text-white">
          Lift & study time
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
        </div>
      ) : students.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No student data yet — share the join code.
        </p>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
          <div className="flex gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-4 rounded bg-brand-500" />
              Minutes
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-4 rounded bg-emerald-500/70" />
              Lift %
            </span>
          </div>
          <ul className="space-y-3">
            {students.map((s) => {
              const minutesPct = (s.totalMinutes / maxMinutes) * 100;
              const lift = s.quizLift ?? 0;
              const liftPct = (Math.abs(lift) / maxLift) * 100;
              const label = s.displayName || s.email.split("@")[0];

              return (
                <li key={s.email} className="text-sm">
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span className="truncate max-w-[60%]">{label}</span>
                    <span className="text-xs text-zinc-500">
                      {s.totalMinutes} min
                      {s.quizLift !== null && (
                        <span className="ml-2 text-brand-300">
                          {lift > 0 ? "+" : ""}
                          {lift}%
                        </span>
                      )}
                      {s.summary && (
                        <span className="ml-2">
                          {s.summary.completionRate}% done
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all"
                        style={{ width: `${minutesPct}%` }}
                      />
                    </div>
                    {s.quizLift !== null && (
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            lift >= 0 ? "bg-emerald-500/70" : "bg-red-500/50"
                          }`}
                          style={{ width: `${liftPct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
