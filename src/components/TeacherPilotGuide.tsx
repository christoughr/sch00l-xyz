"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useAuth } from "./AuthProvider";

type StepState = "done" | "current" | "pending";

function StepIcon({ state }: { state: StepState }) {
  if (state === "done") {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-400 mt-0.5" />;
  }
  if (state === "current") {
    return (
      <span className="h-4 w-4 shrink-0 rounded-full border-2 border-brand-400 mt-0.5" />
    );
  }
  return <Circle className="h-4 w-4 shrink-0 text-zinc-600 mt-0.5" />;
}

export function TeacherPilotGuide() {
  const { user, loading: authLoading, supabaseReady } = useAuth();
  const [supabaseLive, setSupabaseLive] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [classroomCount, setClassroomCount] = useState(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setChecking(true);
      try {
        const health = await fetch("/api/health").then((r) => r.json());
        if (!cancelled) setSupabaseLive(!!health.supabase);
      } catch {
        if (!cancelled) setSupabaseLive(false);
      }

      if (user) {
        try {
          const me = await fetch("/api/teacher/me").then((r) => r.json());
          if (!cancelled) setIsTeacher(!!me.isTeacher);

          if (me.isTeacher) {
            const rooms = await fetch("/api/classrooms").then((r) => r.json());
            if (!cancelled) {
              setClassroomCount(
                Array.isArray(rooms.classrooms) ? rooms.classrooms.length : 0
              );
            }
          }
        } catch {
          if (!cancelled) {
            setIsTeacher(false);
            setClassroomCount(0);
          }
        }
      } else if (!cancelled) {
        setIsTeacher(false);
        setClassroomCount(0);
      }

      if (!cancelled) setChecking(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const teacherEmailOk = supabaseReady && isTeacher;

  const steps: { title: string; body: string; state: StepState }[] = [
    {
      title: "Supabase live",
      body: supabaseLive
        ? "API health shows cloud DB connected."
        : "Waiting for env + redeploy (see SUPABASE_AUTH.md).",
      state: supabaseLive ? "done" : "current",
    },
    {
      title: "Sign in as teacher",
      body: user
        ? isTeacher
          ? `Signed in as ${user.email}`
          : `Signed in — add ${user.email} to TEACHER_EMAILS and redeploy.`
        : "https://sch00l.ai/login with hello@sch00l.ai (magic link).",
      state: teacherEmailOk ? "done" : user ? "current" : supabaseLive ? "current" : "pending",
    },
    {
      title: "Create one classroom",
      body:
        classroomCount > 0
          ? `${classroomCount} classroom(s) — share the join code.`
          : "Use the form below after you sign in.",
      state: classroomCount > 0 ? "done" : teacherEmailOk ? "current" : "pending",
    },
    {
      title: "Invite 15–30 students",
      body: "Share code + https://sch00l.ai/join",
      state: classroomCount > 0 ? "current" : "pending",
    },
    {
      title: "Run one 2-week unit",
      body: "Same topic for everyone — measure class-wide lift.",
      state: "pending",
    },
    {
      title: "Export outcomes",
      body: "Screenshot /outcomes + classroom stats for your pitch deck.",
      state: "pending",
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">School pilot checklist</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Live progress — not an error screen. Empty waitlist is normal on day one.
          </p>
        </div>
        {checking && (
          <Loader2 className="h-4 w-4 animate-spin text-zinc-500 shrink-0" />
        )}
      </div>

      {!authLoading && !user && supabaseLive && (
        <p className="text-sm text-amber-200/90 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          You&apos;re not signed in yet.{" "}
          <Link href="/login" className="text-brand-300 underline">
            Get a magic link
          </Link>
          {" "}— if email doesn&apos;t arrive, set up custom SMTP in{" "}
          <code className="text-brand-200">SUPABASE_AUTH.md</code>.
        </p>
      )}

      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-3 text-sm">
            <StepIcon state={s.state} />
            <div>
              <p
                className={
                  s.state === "done" ? "text-brand-200" : "text-zinc-200"
                }
              >
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
          Public outcomes page →
        </Link>
        <Link href="/study" className="text-sm text-zinc-400 hover:text-white">
          Student demo →
        </Link>
        <span className="text-sm text-zinc-500">
          SMTP: <code className="text-zinc-400">SUPABASE_AUTH.md</code> +{" "}
          <code className="text-zinc-400">supabase/email-templates/</code>
        </span>
      </div>
    </div>
  );
}
