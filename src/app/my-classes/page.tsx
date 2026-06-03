"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageSquare, BookOpen, Zap } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { JoinClassroom } from "@/components/JoinClassroom";
import { ClassDiscussionBanner } from "@/components/ClassDiscussionBanner";
import { StudentAssignments } from "@/components/StudentAssignments";

type ClassRow = {
  id: string;
  name: string;
  joinCode: string;
  classUrl: string;
  forumUrl: string;
};

export default function MyClassesPage() {
  const { user, supabaseReady } = useAuth();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetch("/api/student/classrooms")
      .then((r) => r.json())
      .then((d) => setClasses(d.classrooms ?? []))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-white">My classes</h1>
      <p className="mt-2 text-zinc-400 text-sm">
        Assignments, class discussion, and live battles — all from here.
      </p>

      {!supabaseReady || !user ? (
        <p className="mt-8 text-sm text-zinc-500">
          <Link href="/login" className="text-brand-400 underline">
            Sign in
          </Link>{" "}
          to see your classes.
        </p>
      ) : (
        <>
          <div className="mt-6">
            <ClassDiscussionBanner />
          </div>
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Join a class</h2>
            <JoinClassroom />
          </section>

          <StudentAssignments />

          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-brand-400 mt-8" />
          ) : classes.length === 0 ? (
            <p className="mt-8 text-sm text-zinc-500">
              No classes yet — enter your teacher&apos;s code above.
            </p>
          ) : (
            <ul className="mt-8 space-y-3">
              {classes.map((c) => (
                <li
                  key={c.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Code {c.joinCode}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={c.forumUrl}
                      className="inline-flex items-center gap-1 rounded-lg bg-violet-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Discussion
                    </Link>
                    <Link
                      href={c.classUrl}
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-500/20 px-3 py-1.5 text-xs text-brand-300 hover:bg-brand-500/30"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Class home
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-6 text-xs text-zinc-600">
            <Link href="/community" className="text-brand-400 hover:underline">
              Explore all features →
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
