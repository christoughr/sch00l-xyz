"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import {
  PRACTICE_TO_TRACK,
  savePracticeWeakTags,
} from "@/lib/practice-weak-tags";
import { weakTagsFromMisses } from "@/lib/practice-engine";

type Question = {
  id: string;
  prompt: string;
  choices: string[];
  skillTag?: string;
};

type TestMeta = {
  id: string;
  label: string;
  examFamily: string;
  region: string;
  durationMinutes: number;
  sectionCount: number;
};

type StartPayload = {
  attemptId: string;
  startedAt: string;
  test: TestMeta;
  questions: Question[];
  answerKey: number[];
  guestMode?: boolean;
};

export function PracticeTestRunner({
  testId,
  onExit,
}: {
  testId: string;
  onExit?: () => void;
}) {
  const [phase, setPhase] = useState<"loading" | "running" | "done">("loading");
  const [payload, setPayload] = useState<StartPayload | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    percent: number;
    weakTags: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    setPhase("loading");
    setError(null);
    fetch(`/api/practice/${testId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionCount: 10 }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Could not start test");
        setPayload(data);
        setSecondsLeft((data.test.durationMinutes ?? 30) * 60);
        setPhase("running");
        startRef.current = Date.now();
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Could not start test");
        setPhase("done");
      });
  }, [testId]);

  const finish = useCallback(async () => {
    if (!payload || submitting) return;
    setSubmitting(true);
    try {
      const answerList = payload.questions.map((q, i) => ({
        questionId: q.id,
        choiceIndex: answers[q.id] ?? 0,
        correctIndex: payload.answerKey[i] ?? 0,
        skillTag: q.skillTag,
      }));

      if (payload.guestMode || payload.attemptId.startsWith("guest-")) {
        let score = 0;
        const misses: { skillTag?: string; correct: boolean }[] = [];
        for (const a of answerList) {
          const correct = a.choiceIndex === a.correctIndex;
          if (correct) score++;
          misses.push({ skillTag: a.skillTag, correct });
        }
        const weakTags = weakTagsFromMisses(misses);
        const total = answerList.length;
        const percent = total > 0 ? Math.round((score / total) * 100) : 0;
        savePracticeWeakTags(
          payload.test.id,
          payload.test.label,
          weakTags,
          PRACTICE_TO_TRACK[payload.test.id]
        );
        setResult({ score, total, percent, weakTags });
        setPhase("done");
        return;
      }

      const res = await fetch(
        `/api/practice/attempts/${payload.attemptId}/finish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: answerList }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit");
      savePracticeWeakTags(
        payload.test.id,
        payload.test.label,
        data.weakTags ?? [],
        PRACTICE_TO_TRACK[payload.test.id]
      );
      setResult(data);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit");
    } finally {
      setSubmitting(false);
    }
  }, [payload, answers, submitting]);

  useEffect(() => {
    if (phase !== "running" || !payload) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          finish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, payload, finish]);

  function selectChoice(choiceIndex: number) {
    if (!payload) return;
    const q = payload.questions[index];
    setAnswers((prev) => ({ ...prev, [q.id]: choiceIndex }));
  }

  function next() {
    if (!payload) return;
    if (index < payload.questions.length - 1) {
      setIndex((i) => i + 1);
    } else {
      finish();
    }
  }

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        <p className="text-sm text-zinc-400">Starting practice test…</p>
      </div>
    );
  }

  if (error && !payload) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
        <p className="text-amber-200">{error}</p>
        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white"
          >
            Back
          </button>
        )}
      </div>
    );
  }

  if (phase === "done" && result) {
    const studyTrack = payload ? PRACTICE_TO_TRACK[payload.test.id] : null;
    const weakTopic =
      result.weakTags.length > 0 && payload
        ? `${payload.test.label} — review ${result.weakTags[0]}`
        : null;
    const studyHref = studyTrack
      ? `/study?track=${encodeURIComponent(studyTrack)}${weakTopic ? `&topic=${encodeURIComponent(weakTopic)}` : ""}`
      : "/study";

    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-brand-400 mx-auto" />
        <h2 className="text-xl font-semibold text-white">Test complete</h2>
        <p className="text-3xl font-bold text-white">{result.percent}%</p>
        <p className="text-sm text-zinc-400">
          {result.score} / {result.total} correct
        </p>
        {result.weakTags.length > 0 && (
          <p className="text-sm text-zinc-500">
            Review: {result.weakTags.join(", ")}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {result.weakTags.length > 0 && (
            <Link
              href={studyHref}
              className="rounded-lg bg-brand-500 px-5 py-2 text-sm text-white hover:bg-brand-400"
            >
              Study weak areas →
            </Link>
          )}
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="rounded-lg border border-white/15 px-5 py-2 text-sm text-zinc-300 hover:bg-white/5"
            >
              Back to tests
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!payload) return null;

  const q = payload.questions[index];
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const selected = answers[q.id];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{payload.test.label}</h2>
          <p className="text-xs text-zinc-500">
            Question {index + 1} of {payload.questions.length}
            {payload.guestMode && " · guest mode"}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-mono ${
            secondsLeft < 60
              ? "border-amber-500/50 text-amber-300"
              : "border-white/10 text-zinc-300"
          }`}
        >
          <Clock className="h-4 w-4" />
          {mins}:{secs.toString().padStart(2, "0")}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <p className="text-white">{q.prompt}</p>
        <ul className="mt-4 space-y-2">
          {q.choices.map((choice, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => selectChoice(i)}
                className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition ${
                  selected === i
                    ? "border-brand-400/50 bg-brand-500/10 text-white"
                    : "border-white/10 bg-surface-900 text-zinc-300 hover:border-white/20"
                }`}
              >
                {choice}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {payload.questions.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-8 w-8 rounded text-xs ${
              i === index
                ? "bg-brand-500 text-white"
                : answers[payload.questions[i].id] !== undefined
                  ? "bg-brand-500/20 text-brand-300"
                  : "bg-white/5 text-zinc-500"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={next}
          disabled={selected === undefined || submitting}
          className="rounded-lg bg-brand-500 px-5 py-2 text-sm text-white hover:bg-brand-400 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : index === payload.questions.length - 1 ? (
            "Submit test"
          ) : (
            "Next"
          )}
        </button>
      </div>

      {error && (
        <p className="text-sm text-amber-300 flex items-center gap-1">
          <XCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
