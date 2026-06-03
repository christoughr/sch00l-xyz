"use client";

import { useState } from "react";
import { Loader2, UserRound, Mail } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { saveTutorRequestLocal } from "@/lib/tutor-handoff";
import type { SubjectId } from "@/lib/types";
import type { TutorBudgetTier } from "@/lib/tutor-pricing";

export function TutorRequestForm({
  subject,
  topic,
  transcript,
  preScore,
  postScore,
  budgetTier = "standard",
  rateRange,
  compact = false,
}: {
  subject: SubjectId;
  topic?: string;
  transcript?: string;
  preScore?: number | null;
  postScore?: number | null;
  budgetTier?: TutorBudgetTier;
  rateRange?: { min: number; typical: number; max: number };
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "before_test">("normal");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setMessage("Email required so we can match you with a tutor.");
      setStatus("error");
      return;
    }
    setStatus("loading");

    try {
      const res = await fetch("/api/tutors/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || undefined,
          subject,
          topic,
          transcript,
          preScore: preScore ?? undefined,
          postScore: postScore ?? undefined,
          urgency,
          budgetTier,
          rateMin: rateRange?.min,
          rateMax: rateRange?.max,
          summarize: !!transcript,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.mode === "local") {
        saveTutorRequestLocal({
          studentEmail: email.trim() || undefined,
          subject,
          topic,
          sessionSummary: data.summary ?? "",
          preScore: preScore ?? undefined,
          postScore: postScore ?? undefined,
          urgency,
        });
      }

      trackEvent("tutor_request", { subject, urgency, budgetTier });
      setStatus("ok");
      setMessage(
        data.message ??
          `We'll match tutors in your $${rateRange?.min ?? "?"}-$${rateRange?.max ?? "?"}/hr range.`
      );
      setEmail("");
      setUrgency("normal");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "ok") {
    return (
      <p className="text-sm text-brand-300 rounded-xl border border-brand-400/30 bg-brand-500/10 p-4">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? "space-y-3" : "space-y-4"}>
      {compact && rateRange && (
        <p className="text-xs text-zinc-500">
          Human tutors ~${rateRange.min}–${rateRange.max}/hr · you approve the match
        </p>
      )}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded-xl border border-white/10 bg-surface-900 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-400">
        <input
          type="checkbox"
          checked={urgency === "before_test"}
          onChange={(e) =>
            setUrgency(e.target.checked ? "before_test" : "normal")
          }
        />
        Test or exam within 48 hours
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-400 disabled:opacity-50"
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserRound className="h-4 w-4" />
        )}
        Request human tutor
      </button>
      {message && status === "error" && (
        <p className="text-sm text-red-400">{message}</p>
      )}
    </form>
  );
}
