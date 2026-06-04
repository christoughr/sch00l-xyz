"use client";

import { useCallback, useEffect, useState } from "react";
import { Layers, Loader2, RotateCcw } from "lucide-react";
import {
  dueFlashcards,
  loadFlashcards,
  mergeCloudFlashcards,
  reviewCard,
  saveFlashcards,
} from "@/lib/flashcards-local";
import type { Flashcard } from "@/lib/types";
import { useAuth } from "./AuthProvider";
import Link from "next/link";

export function FlashcardReview() {
  const { user, loading: authLoading, supabaseReady } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setSyncWarning(null);
    if (!user) {
      setCards([]);
      setDeck([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/flashcards");
      if (res.ok) {
        const data = await res.json();
        const rows = (data.cards ?? []) as Record<string, unknown>[];
        mergeCloudFlashcards(rows);
        const merged = loadFlashcards();
        setCards(merged);
        setDeck(dueFlashcards(merged));
        setLoading(false);
        return;
      }
      setSyncWarning("Using cards saved on this device — cloud sync unavailable.");
    } catch {
      setSyncWarning("Using cards saved on this device — cloud sync unavailable.");
    }
    const local = loadFlashcards();
    setCards(local);
    setDeck(dueFlashcards(local));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function rate(quality: number) {
    const current = deck[index];
    if (!current) return;
    const updated = reviewCard(current, quality);
    const all = cards.map((c) => (c.id === updated.id ? updated : c));
    setCards(all);
    saveFlashcards(all);

    if (user) {
      try {
        const res = await fetch("/api/flashcards", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: updated.id,
            ease_factor: updated.easeFactor,
            interval_days: updated.intervalDays,
            repetitions: updated.repetitions,
            next_review_at: updated.nextReviewAt,
          }),
        });
        if (!res.ok) {
          setSyncWarning("Review saved locally; cloud sync failed.");
        }
      } catch {
        setSyncWarning("Review saved locally; cloud sync failed.");
      }
    }

    const remaining = deck.filter((_, i) => i !== index);
    setDeck(remaining);
    setIndex(0);
    setFlipped(false);
  }

  if (authLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center max-w-md mx-auto">
        <Layers className="h-10 w-10 text-zinc-500 mx-auto" />
        <p className="mt-4 text-white font-medium">Sign in to review flashcards</p>
        <p className="text-sm text-zinc-400 mt-2">
          Your cards are saved to your account after study sessions — not on this browser
          while logged out.
        </p>
        {supabaseReady ? (
          <Link
            href="/login"
            className="inline-block mt-4 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-400"
          >
            Sign in
          </Link>
        ) : (
          <Link
            href="/study"
            className="inline-block mt-4 text-brand-400 hover:underline text-sm"
          >
            Go study →
          </Link>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <Layers className="h-10 w-10 text-zinc-500 mx-auto" />
        <p className="mt-4 text-white font-medium">No flashcards yet</p>
        <p className="text-sm text-zinc-400 mt-2">
          Finish a study session and tap &quot;Generate flashcards&quot;.
        </p>
        <Link
          href="/study"
          className="inline-block mt-4 text-brand-400 hover:underline text-sm"
        >
          Go study →
        </Link>
      </div>
    );
  }

  if (deck.length === 0) {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center">
        <p className="text-white font-medium">All caught up!</p>
        <p className="text-sm text-zinc-400 mt-2">
          {cards.length} cards in deck — next reviews scheduled.
        </p>
        <button
          type="button"
          onClick={() => setDeck(cards)}
          className="mt-4 inline-flex items-center gap-2 text-sm text-brand-400 hover:underline"
        >
          <RotateCcw className="h-4 w-4" /> Study all anyway
        </button>
      </div>
    );
  }

  const card = deck[index];

  return (
    <div className="max-w-lg mx-auto">
      {syncWarning && (
        <p className="mb-4 text-sm text-amber-300 text-center" role="status">
          {syncWarning}
        </p>
      )}
      <p className="text-center text-sm text-zinc-500 mb-4">
        {deck.length} due · {cards.length} total
      </p>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-expanded={flipped}
        aria-label={flipped ? "Show question" : "Show answer"}
        className="w-full min-h-[220px] rounded-2xl border border-white/10 bg-surface-800 p-8 text-center transition hover:border-brand-400/40"
      >
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
          {flipped ? "Answer" : "Question"}
        </p>
        <p className="text-lg text-white leading-relaxed">
          {flipped ? card.back : card.front}
        </p>
        <p className="text-xs text-zinc-600 mt-6">Tap to flip</p>
      </button>

      {flipped && (
        <div className="mt-6 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => rate(1)}
            className="rounded-xl border border-red-500/30 py-3 text-sm text-red-300 hover:bg-red-500/10"
          >
            Hard
          </button>
          <button
            type="button"
            onClick={() => rate(3)}
            className="rounded-xl border border-amber-500/30 py-3 text-sm text-amber-200 hover:bg-amber-500/10"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => rate(5)}
            className="rounded-xl border border-green-500/30 py-3 text-sm text-green-300 hover:bg-green-500/10"
          >
            Easy
          </button>
        </div>
      )}
    </div>
  );
}
