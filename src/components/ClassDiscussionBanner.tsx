"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, X, Zap, Users } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const DISMISS_KEY = "sch00l_discussion_banner_dismiss_v1";

type ClassRow = { id: string; name: string; forumUrl: string };

export function ClassDiscussionBanner() {
  const { user, supabaseReady } = useAuth();
  const [dismissed, setDismissed] = useState(true);
  const [classes, setClasses] = useState<ClassRow[]>([]);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setClasses([]);
      return;
    }
    fetch("/api/student/classrooms")
      .then((r) => r.json())
      .then((d) => setClasses((d.classrooms ?? []).slice(0, 3)))
      .catch(() => setClasses([]));
  }, [user]);

  if (dismissed) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  const hasClasses = classes.length > 0;

  return (
    <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/15 to-brand-500/10 p-4 sm:p-5 relative">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 rounded-lg p-1 text-zinc-500 hover:text-white hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex flex-wrap items-start gap-4 pr-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20">
          <MessageSquare className="h-5 w-5 text-violet-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">
            {hasClasses
              ? "Class discussion is live"
              : "Study with your class — discussion & battles"}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            {hasClasses
              ? "Ask classmates and your teacher in class threads — AI moderation included."
              : "Join with your teacher’s code to unlock Piazza-style threads and Kahoot-style battles."}
          </p>
          {hasClasses && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {classes.map((c) => (
                <li key={c.id}>
                  <Link
                    href={c.forumUrl}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 hover:border-violet-400/40 hover:text-white"
                  >
                    <MessageSquare className="h-3 w-3 text-violet-400" />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {hasClasses ? (
              <Link
                href="/my-classes"
                className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
              >
                <Users className="h-4 w-4" />
                My classes
              </Link>
            ) : supabaseReady ? (
              <Link
                href={user ? "/join" : "/login"}
                className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
              >
                {user ? "Join a class" : "Sign in to join"}
              </Link>
            ) : null}
            <Link
              href="/community"
              className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
            >
              All features
            </Link>
            {!hasClasses && (
              <Link
                href="/my-classes"
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Live battles
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
