"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { QuizQuestion, SubjectId } from "@/lib/types";
import { saveQuizResultLocal } from "@/lib/quiz-local";

export function SessionQuiz({
  subject,
  topic,
  phase,
  transcript,
  onComplete,
}: {
  subject: SubjectId;
  topic?: string;
  phase: "pre" | "post";
  transcript?: string;
  onComplete?: (score: number, total: number) => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  async function loadQuiz() {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, phase, transcript }),
      });
      const data = await res.json();
      setQuestions(data.questions ?? []);
    } finally {
      setLoading(false);
    }
  }

  function pick(optionIndex: number) {
    if (!questions || selected !== null) return;
    setSelected(optionIndex);
    const q = questions[index];
    const correct = optionIndex === q.correctIndex;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => ({ ...a, [q.id]: optionIndex }));
  }

  async function next() {
    if (!questions) return;
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setSelected(null);
      return;
    }

    const total = questions.length;
    const finalScore = questions.reduce((acc, q) => {
      const picked = answers[q.id];
      return acc + (picked === q.correctIndex ? 1 : 0);
    }, 0);

    setDone(true);
    saveQuizResultLocal({
      subject,
      topic,
      phase,
      score: finalScore,
      total,
    });
    await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        topic,
        phase,
        score: finalScore,
        total,
        answers,
      }),
    });
    onComplete?.(finalScore, total);
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
        <button
          type="button"
          onClick={loadQuiz}
          disabled={loading}
          className="mt-4 rounded-xl bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </span>
          ) : (
            `Start ${phase} quiz`
          )}
        </button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-brand-400 mx-auto" />
        <p className="mt-3 text-xl font-semibold text-white">
          {score}/{questions.length} correct ({pct}%)
        </p>
        <p className="text-sm text-zinc-400 mt-1">
          {phase === "post"
            ? "Compare with your pre-quiz after a few sessions."
            : "Now study — we'll check again after."}
        </p>
      </div>
    );
  }

  const q = questions[index];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs text-zinc-500 mb-2">
        Question {index + 1} of {questions.length}
      </p>
      <h3 className="text-white font-medium">{q.question}</h3>
      <ul className="mt-4 space-y-2">
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
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm text-zinc-200 transition ${style}`}
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
      {selected !== null && (
        <div className="mt-4">
          <p className="text-sm text-zinc-400 flex items-start gap-2">
            {selected === q.correctIndex ? (
              <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            )}
            {q.explanation}
          </p>
          <button
            type="button"
            onClick={next}
            className="mt-4 rounded-xl bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400"
          >
            {index + 1 < questions.length ? "Next" : "Finish"}
          </button>
        </div>
      )}
    </div>
  );
}
