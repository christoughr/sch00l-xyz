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
  const [studentCount, setStudentCount] = useState(0);
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
            const [rooms, pilot] = await Promise.all([
              fetch("/api/classrooms").then((r) => r.json()),
              fetch("/api/teacher/pilot-status").then((r) => r.json()),
            ]);
            if (!cancelled) {
              setClassroomCount(
                Array.isArray(rooms.classrooms) ? rooms.classrooms.length : 0
              );
              setStudentCount(pilot.studentCount ?? 0);
            }
          }
        } catch {
          if (!cancelled) {
            setIsTeacher(false);
            setClassroomCount(0);
            setStudentCount(0);
          }
        }
      } else if (!cancelled) {
        setIsTeacher(false);
        setClassroomCount(0);
        setStudentCount(0);
      }

      if (!cancelled) setChecking(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const teacherEmailOk = supabaseReady && isTeacher;
  const inviteDone = classroomCount > 0;
  const unitDone = true;
  const exportReady = classroomCount > 0;

  const steps: { title: string; body: string; state: StepState }[] = [
    {
      title: "Platform ready",
      body: supabaseLive
        ? "Cloud connected — classrooms and progress sync."
        : "Connecting… refresh in a minute.",
      state: supabaseLive ? "done" : "current",
    },
    {
      title: "Sign in as teacher",
      body: user
        ? isTeacher
          ? `Signed in as ${user.email}`
          : `Signed in as ${user.email} — teacher access pending setup.`
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
      title: "Invite students",
      body: inviteDone
        ? studentCount > 0
          ? `${studentCount} student(s) on roster — share https://sch00l.ai/join + code.`
          : "Share https://sch00l.ai/join + code (any class size)."
        : "Create a classroom below, then share join link + code.",
      state: inviteDone ? "done" : "pending",
    },
    {
      title: "Run one 2-week unit",
      body:
        "Assign a track on the class Dashboard — students study; you watch minutes and lift.",
      state: unitDone && inviteDone ? "done" : inviteDone ? "current" : "pending",
    },
    {
      title: "Export outcomes",
      body: "Screenshot /outcomes + classroom Dashboard for your pitch deck.",
      state: exportReady ? "current" : "pending",
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
          {" "}— check spam, or try again in a few minutes.
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
      </div>
    </div>
  );
}
