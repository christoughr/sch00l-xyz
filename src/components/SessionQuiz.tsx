"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, XCircle, AlertCircle } from "lucide-react";
import type { QuizQuestion, SubjectId } from "@/lib/types";
import { saveQuizResultLocal } from "@/lib/quiz-local";
import {
  getLocalStudentContext,
  hasPersonalizationData,
} from "@/lib/student-profile";
import { getOrCreateStudySessionId } from "@/lib/study-session-id";
export function SessionQuiz({
  subject,
  topic,
  phase,
  transcript,
  sessionId,
  preScoreToday,
  onComplete,
}: {
  subject: SubjectId;
  topic?: string;
  phase: "pre" | "post";
  transcript?: string;
  sessionId?: string;
  preScoreToday?: number | null;
  onComplete?: (score: number, total: number) => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [doneResult, setDoneResult] = useState<{ score: number; total: number } | null>(
    null
  );
  const [syncWarning, setSyncWarning] = useState<string | null>(null);
  const answersRef = useRef<Record<string, number>>({});
  const autoStarted = useRef(false);

  const effectiveSessionId = sessionId || getOrCreateStudySessionId();
  const skipDoneScreen = !!onComplete;

  async function loadQuiz() {
    setLoading(true);
    setLoadError(null);
    try {
      const ctx = getLocalStudentContext({
        subject,
        preScoreToday: preScoreToday ?? null,
      });
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic,
          phase,
          transcript,
          studentContext: hasPersonalizationData(ctx) ? ctx : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load quiz");
      const qs = data.questions as QuizQuestion[] | undefined;
      if (!qs?.length) throw new Error("No questions returned. Try again.");
      answersRef.current = {};
      setQuestions(qs);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load quiz");
      setQuestions(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoStarted.current) return;
    autoStarted.current = true;
    void loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  function pick(optionIndex: number) {
    if (!questions || selected !== null) return;
    setSelected(optionIndex);
    const q = questions[index];
    if (optionIndex === q.correctIndex) {
      // score tracked via answersRef
    }
    answersRef.current = { ...answersRef.current, [q.id]: optionIndex };
  }

  function scoreFromAnswers(qs: QuizQuestion[]): number {
    return qs.reduce((acc, q) => {
      const picked = answersRef.current[q.id];
      return acc + (picked === q.correctIndex ? 1 : 0);
    }, 0);
  }

  async function next() {
    if (!questions) return;
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setSelected(null);
      return;
    }

    const total = questions.length;
    const finalScore = scoreFromAnswers(questions);

    saveQuizResultLocal({
      subject,
      topic,
      phase,
      score: finalScore,
      total,
      sessionId: effectiveSessionId,
    });

    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic,
          phase,
          score: finalScore,
          total,
          answers: answersRef.current,
          sessionId: effectiveSessionId,
        }),
      });
      if (!res.ok) {
        setSyncWarning("Quiz saved on this device; cloud sync failed.");
      }
    } catch {
      setSyncWarning("Quiz saved on this device; cloud sync failed.");
    }

    if (skipDoneScreen) {
      onComplete?.(finalScore, total);
      return;
    }

    setDoneResult({ score: finalScore, total });
    setDone(true);
  }

  if (!questions) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">
          {phase === "pre" ? "Pre-session check" : "Post-session quiz"}
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          {phase === "pre"
            ? "Quick baseline — 3 questions before you study."
            : "See what stuck — measures learning lift for your progress."}
        </p>
        {loadError && (
          <p
            className="mt-3 flex items-center gap-2 text-sm text-red-400"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {loadError}
          </p>
        )}
        <button
          type="button"
          onClick={loadQuiz}
          disabled={loading}
          className="mt-4 rounded-xl bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading quiz…
            </span>
          ) : loadError ? (
            "Retry quiz"
          ) : (
            `Start ${phase} quiz`
          )}
        </button>
      </div>
    );
  }

  if (done && !skipDoneScreen && doneResult) {
    const { score: finalScore, total } = doneResult;
    const pct = Math.round((finalScore / total) * 100);
    return (
      <div className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-brand-400 mx-auto" />
        <p className="mt-3 text-xl font-semibold text-white">
          {finalScore}/{total} correct ({pct}%)
        </p>
        {syncWarning && (
          <p className="mt-2 text-xs text-amber-300" role="status">
            {syncWarning}
          </p>
        )}
        <p className="text-sm text-zinc-400 mt-1">
          {phase === "post"
            ? "Compare with your pre-quiz on Progress."
            : "Now study — we'll check again after."}
        </p>
      </div>
    );
  }

  const q = questions[index];
  const feedback =
    selected !== null
      ? selected === q.correctIndex
        ? "Correct"
        : "Incorrect"
      : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      {syncWarning && (
        <p className="mb-3 text-xs text-amber-300" role="status">
          {syncWarning}
        </p>
      )}
      <p className="text-xs text-zinc-500 mb-2">
        Question {index + 1} of {questions.length}
      </p>
      <h3 className="text-white font-medium">{q.question}</h3>
      <ul className="mt-4 space-y-2" role="listbox" aria-label="Answer choices">
        {q.options.map((opt, i) => {
          let style = "border-white/10 hover:border-white/20";
          if (selected !== null) {
            if (i === q.correctIndex) style = "border-green-500/50 bg-green-500/10";
            else if (i === selected)
              style = "border-red-500/50 bg-red-500/10";
          }
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => pick(i)}
                disabled={selected !== null}
                aria-pressed={selected === i}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm text-zinc-200 transition focus-visible:ring-2 focus-visible:ring-brand-400 ${style}`}
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
      {selected !== null && (
        <div className="mt-4">
          <p
            className="text-sm text-zinc-400 flex items-start gap-2"
            role="status"
            aria-live="polite"
          >
            {selected === q.correctIndex ? (
              <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <span>
              <span className="sr-only">{feedback}. </span>
              {q.explanation}
            </span>
          </p>
          <button
            type="button"
            onClick={next}
            className="mt-4 rounded-xl bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400 focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            {index + 1 < questions.length ? "Next" : "Finish"}
          </button>
        </div>
      )}
    </div>
  );
}
