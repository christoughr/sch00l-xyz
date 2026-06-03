"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Loader2, TrendingUp, Users } from "lucide-react";

type ClassroomStatsData = {
  classroom: { name: string; join_code: string };
  summary: {
    studentCount: number;
    totalMinutes: number;
    avgStreak: number;
    avgQuizLift: number | null;
  };
  students: {
    id: string;
    email: string;
    streakDays: number;
    totalMinutes: number;
    totalSessions: number;
    quizLift: number | null;
  }[];
};

export function ClassroomStats({ classroomId }: { classroomId: string }) {
  const [data, setData] = useState<ClassroomStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/classrooms/${classroomId}/stats`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [classroomId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (!data?.classroom) {
    return <p className="text-red-400">Could not load classroom.</p>;
  }

  const { classroom, summary, students } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{classroom.name}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Join code:{" "}
          <span className="font-mono text-brand-300">{classroom.join_code}</span>
          {" - "}students use{" "}
          <Link href="/join" className="text-brand-400 hover:underline">
            /join
          </Link>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <Users className="h-5 w-5 text-brand-400 mb-2" />
          <p className="text-2xl font-semibold text-white">
            {summary.studentCount}
          </p>
          <p className="text-sm text-zinc-400">Students</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <Clock className="h-5 w-5 text-brand-400 mb-2" />
          <p className="text-2xl font-semibold text-white">
            {summary.totalMinutes} min
          </p>
          <p className="text-sm text-zinc-400">Total study time</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <TrendingUp className="h-5 w-5 text-brand-400 mb-2" />
          <p className="text-2xl font-semibold text-white">
            {summary.avgQuizLift !== null
              ? `${summary.avgQuizLift > 0 ? "+" : ""}${summary.avgQuizLift}%`
              : "-"}
          </p>
          <p className="text-sm text-zinc-400">Avg learning lift</p>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Roster</h2>
        {students.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No students yet. Share the join code.
          </p>
        ) : (
          <ul className="space-y-2">
            {students.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="text-zinc-300">{s.email}</span>
                <span className="text-zinc-500">
                  {s.totalMinutes} min - {s.totalSessions} sessions
                  {s.quizLift !== null && (
                    <span className="text-brand-300 ml-2">
                      lift {s.quizLift > 0 ? "+" : ""}
                      {s.quizLift}%
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
