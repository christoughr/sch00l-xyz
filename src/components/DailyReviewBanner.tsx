"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { dueFlashcards, loadFlashcards } from "@/lib/flashcards-local";
import { useEffect, useState } from "react";
import { FLASHCARDS_UPDATED } from "@/lib/flashcards-events";
import { useAuth } from "./AuthProvider";

export function DailyReviewBanner() {
  const { user, loading } = useAuth();
  const [due, setDue] = useState(0);

  useEffect(() => {
    if (!user) {
      setDue(0);
      return;
    }
    const refresh = () => setDue(dueFlashcards(loadFlashcards()).length);
    refresh();
    window.addEventListener(FLASHCARDS_UPDATED, refresh);
    return () => window.removeEventListener(FLASHCARDS_UPDATED, refresh);
  }, [user]);

  if (loading || !user || due === 0) return null;

  return (
    <div className="rounded-2xl border border-brand-400/30 bg-brand-500/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-brand-200">
        <Layers className="h-4 w-4" />
        <span>
          <strong className="text-white">{due}</strong> flashcard{due === 1 ? "" : "s"}{" "}
          due for review today
        </span>
      </div>
      <Link
        href="/flashcards"
        className="rounded-lg bg-brand-500 px-4 py-1.5 text-sm text-white hover:bg-brand-400"
      >
        Review now
      </Link>
    </div>
  );
}
