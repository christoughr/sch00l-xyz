"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Loader2,
  Plus,
  Users,
  Clock,
  TrendingUp,
  Mail,
  UserRound,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { SITE_DOMAIN } from "@/lib/site";

type Classroom = {
  id: string;
  name: string;
  join_code: string;
  created_at: string;
};

type WaitlistEntry = {
  email: string;
  source: string;
  is_edu?: boolean;
  created_at: string;
};

type TutorRequestEntry = {
  id: string;
  student_email: string | null;
  subject: string;
  topic: string | null;
  session_summary: string | null;
  pre_score: number | null;
  post_score: number | null;
  urgency: string;
  created_at: string;
};

export function TeacherPortal() {
  const { user, supabaseReady } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [tutorRequests, setTutorRequests] = useState<TutorRequestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const meRes = await fetch("/api/teacher/me");
      const me = await meRes.json();
      setIsTeacher(me.isTeacher);

      if (!me.isTeacher) {
        setLoading(false);
        return;
      }

      await fetch("/api/teacher/activate", { method: "POST" });

      const [classRes, waitRes, tutorRes] = await Promise.all([
        fetch("/api/classrooms"),
        fetch("/api/teacher/waitlist"),
        fetch("/api/tutors/requests"),
      ]);

      if (classRes.ok) {
        const data = await classRes.json();
        setClassrooms(data.classrooms ?? []);
      }
      if (waitRes.ok) {
        const data = await waitRes.json();
        setWaitlist(data.entries ?? []);
      }
      if (tutorRes.ok) {
        const data = await tutorRes.json();
        setTutorRequests(data.requests ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
    else setLoading(false);
  }, [user, load]);

  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create classroom");
      setNewName("");
      await load();
    } catch (e) {
      setCreateError(
        e instanceof Error ? e.message : "Could not create classroom"
      );
    } finally {
      setCreating(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!supabaseReady) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-100">
        Add Supabase env vars and run SQL migrations{" "}
        <strong className="text-white">001 → 007</strong> to enable the teacher
        portal.
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-zinc-300">Sign in with your teacher email.</p>
        <Link
          href="/login"
          className="inline-block mt-4 text-brand-400 hover:underline"
        >
          Go to login →
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <p className="text-white font-medium">Teacher access</p>
        <p className="mt-2 text-sm text-zinc-400">
          Add your email to <code className="text-brand-300">TEACHER_EMAILS</code>{" "}
          in Vercel / <code className="text-brand-300">.env.local</code>, then
          refresh.
        </p>
        <p className="mt-2 text-xs text-zinc-500">Signed in as {user.email}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Your classrooms</h2>
        <form onSubmit={createClass} className="flex gap-2 mb-6">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. AP Biology Period 2"
            className="flex-1 rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-white focus:border-brand-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-white hover:bg-brand-400 disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create
          </button>
        </form>
        {createError && (
          <p className="mb-4 text-sm text-amber-300" role="alert">
            {createError}
          </p>
        )}

        {classrooms.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No classrooms yet. Create one and share the join code with students.
          </p>
        ) : (
          <ul className="space-y-3">
            {classrooms.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <Link
                    href={`/teacher/${c.id}`}
                    className="font-medium text-white hover:text-brand-300"
                  >
                    {c.name}
                  </Link>
                  <p className="text-xs text-zinc-500 mt-1">
                    Code:{" "}
                    <span className="font-mono text-brand-300">{c.join_code}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyCode(c.join_code)}
                    className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
                  >
                    <Copy className="h-3 w-3" />
                    {copied === c.join_code ? "Copied!" : "Copy code"}
                  </button>
                  <Link
                    href={`/teacher/${c.id}`}
                    className="rounded-lg bg-brand-500/20 px-3 py-1.5 text-xs text-brand-300 hover:bg-brand-500/30"
                  >
                    Dashboard →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <UserRound className="h-5 w-5 text-brand-400" />
          Human tutor requests ({tutorRequests.length})
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Students who asked for a human after AI sessions — with session context.
        </p>
        {tutorRequests.length === 0 ? (
          <p className="text-sm text-zinc-600">No open requests.</p>
        ) : (
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {tutorRequests.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm"
              >
                <p className="text-zinc-300">
                  {r.student_email ?? "Anonymous"} · {r.subject}
                  {r.topic && ` · ${r.topic}`}
                </p>
                {(r.pre_score !== null || r.post_score !== null) && (
                  <p className="text-xs text-brand-300 mt-1">
                    Quiz: {r.pre_score ?? "?"}% → {r.post_score ?? "?"}%
                  </p>
                )}
                {r.session_summary && (
                  <p className="text-xs text-zinc-500 mt-2 line-clamp-3">
                    {r.session_summary}
                  </p>
                )}
                {r.urgency === "before_test" && (
                  <span className="inline-block mt-2 text-xs text-amber-300">
                    Urgent — test soon
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Mail className="h-5 w-5 text-brand-400" />
          Waitlist ({waitlist.length})
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Emails from landing ({SITE_DOMAIN}) — export for outreach.
        </p>
        {waitlist.length === 0 ? (
          <p className="text-sm text-zinc-600">No signups yet.</p>
        ) : (
          <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="text-zinc-500 border-b border-white/10">
                <tr>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3 hidden sm:table-cell">Edu</th>
                  <th className="text-left p-3 hidden sm:table-cell">Source</th>
                </tr>
              </thead>
              <tbody>
                {waitlist.slice(0, 50).map((w) => (
                  <tr key={w.email} className="border-b border-white/5">
                    <td className="p-3 text-zinc-300">{w.email}</td>
                    <td className="p-3 text-zinc-500 hidden sm:table-cell">
                      {w.is_edu ? "✓" : "—"}
                    </td>
                    <td className="p-3 text-zinc-500 hidden sm:table-cell">
                      {w.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export function ClassroomStats({ classroomId }: { classroomId: string }) {
  const [data, setData] = useState<{
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
  } | null>(null);
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
          — students use{" "}
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
              : "—"}
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
                  {s.totalMinutes} min · {s.totalSessions} sessions
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
