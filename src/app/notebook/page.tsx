"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Sparkles, MessageCircle, ListChecks } from "lucide-react";

type Mode = "summary" | "outline" | "qa" | "quiz";

const MODES: { id: Mode; label: string; icon: typeof Sparkles }[] = [
  { id: "summary", label: "Summarize", icon: Sparkles },
  { id: "outline", label: "Outline", icon: ListChecks },
  { id: "qa", label: "Ask", icon: MessageCircle },
  { id: "quiz", label: "Quiz me", icon: BookOpen },
];

export default function NotebookPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<Mode>("summary");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/notebook/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || undefined,
          content,
          mode,
          question: mode === "qa" ? question : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs uppercase tracking-wide text-brand-400">Study Notebook</p>
      <h1 className="mt-2 text-3xl font-bold text-white">
        Paste notes. Get summaries, Q&amp;A, and quizzes.
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-zinc-400 leading-relaxed">
        Like NotebookLM for studying: drop a chapter, lecture notes, or article excerpt.
        sch00l turns it into study-ready output — then jump into a{" "}
        <Link href="/study" className="text-brand-400 underline">
          live tutor session
        </Link>{" "}
        or{" "}
        <Link href="/flashcards" className="text-brand-400 underline">
          flashcards
        </Link>
        . Better than static SparkNotes — interactive and tied to your progress.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title (optional) — e.g. Macbeth Act 1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
          />
          <textarea
            placeholder="Paste reading, lecture notes, or textbook excerpt (min ~80 characters)…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
          />
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  mode === m.id
                    ? "bg-brand-500 text-white"
                    : "border border-white/10 text-zinc-300 hover:bg-white/5"
                }`}
              >
                <m.icon className="h-4 w-4" />
                {m.label}
              </button>
            ))}
          </div>
          {mode === "qa" && (
            <input
              type="text"
              placeholder="Your question about the source…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
            />
          )}
          <button
            type="button"
            onClick={analyze}
            disabled={loading || content.length < 80}
            className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-400 disabled:opacity-50"
          >
            {loading ? "Working…" : "Analyze"}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 min-h-[320px]">
          <h2 className="text-sm font-semibold text-zinc-300">Output</h2>
          {result ? (
            <pre className="mt-4 whitespace-pre-wrap text-sm text-zinc-200 font-sans leading-relaxed">
              {result}
            </pre>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              Summaries, outlines, answers, and quiz questions appear here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
