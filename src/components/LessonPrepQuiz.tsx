"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";

export function LessonPrepQuiz({ lessonId }: { lessonId: string | null }) {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!lessonId) {
      setQuestions(null);
      setLoadError(null);
      setIndex(0);
      setSelected(null);
      setScore(0);
      setDone(false);
      setRevealed(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setQuestions(null);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setRevealed(false);

    fetch(`/api/lessons/${lessonId}/quiz`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const qs = data.questions as QuizQuestion[] | undefined;
        if (!qs?.length) {
          setLoadError(
            data.hint
              ? "Prep quiz coming soon — run generate-lesson-quizzes script."
              : "No prep questions for this lesson yet."
          );
          return;
        }
        setQuestions(qs);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not load prep quiz.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  if (!lessonId) return null;

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading prep quiz…
      </p>
    );
  }

  if (loadError) {
    return <p className="text-xs text-zinc-500">{loadError}</p>;
  }

  if (!questions?.length) return null;

  if (done) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
        <p className="font-medium text-white">
          Prep quiz: {score}/{questions.length}
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          Use the AI tutor below to go deeper on anything you missed.
        </p>
      </div>
    );
  }

  const q = questions[index];
  const isCorrect = selected !== null && selected === q.correctIndex;

  return (
    <div className="rounded-lg border border-brand-500/20 bg-brand-500/5 p-3">
      <p className="text-xs font-medium text-brand-300 mb-2">
        Lesson prep · {index + 1}/{questions.length}
      </p>
      <p className="text-sm text-white mb-3">{q.question}</p>
      <ul className="space-y-1.5 mb-3">
        {q.options.map((opt, i) => {
          let cls =
            "w-full rounded-lg border px-3 py-2 text-left text-xs transition ";
          if (!revealed) {
            cls +=
              selected === i
                ? "border-brand-400 bg-brand-500/20 text-white"
                : "border-white/10 text-zinc-300 hover:border-white/20";
          } else if (i === q.correctIndex) {
            cls += "border-emerald-500/50 bg-emerald-500/10 text-emerald-200";
          } else if (selected === i) {
            cls += "border-red-500/50 bg-red-500/10 text-red-200";
          } else {
            cls += "border-white/5 text-zinc-500";
          }
          return (
            <li key={i}>
              <button
                type="button"
                disabled={revealed}
                onClick={() => setSelected(i)}
                className={cls}
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
      {revealed && q.explanation && (
        <p className="text-xs text-zinc-400 mb-3">{q.explanation}</p>
      )}
      <div className="flex items-center gap-2">
        {!revealed ? (
          <button
            type="button"
            disabled={selected === null}
            onClick={() => {
              if (selected === q.correctIndex) setScore((s) => s + 1);
              setRevealed(true);
            }}
            className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            Check
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (index + 1 >= questions.length) {
                setDone(true);
              } else {
                setIndex((i) => i + 1);
                setSelected(null);
                setRevealed(false);
              }
            }}
            className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white"
          >
            {isCorrect ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-red-400" />
            )}
            {index + 1 >= questions.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
