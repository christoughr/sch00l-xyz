"use client";

import { useState } from "react";
import Link from "next/link";
import { SubjectPicker } from "@/components/SubjectPicker";
import { TutorChat } from "@/components/TutorChat";
import { SessionQuiz } from "@/components/SessionQuiz";
import type { SubjectId } from "@/lib/types";

type Step = "setup" | "pre" | "study" | "post" | "done";

export default function StudyPage() {
  const [subject, setSubject] = useState<SubjectId>("math");
  const [gradeLevel, setGradeLevel] = useState("");
  const [topic, setTopic] = useState("");
  const [step, setStep] = useState<Step>("setup");
  const [preScore, setPreScore] = useState<number | null>(null);
  const [postScore, setPostScore] = useState<number | null>(null);
  const [transcript, setTranscript] = useState("");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Study session</h1>
        <p className="mt-2 text-zinc-400">
          Pre-quiz → tutor → post-quiz → flashcards. Built for measurable learning
          lift.
        </p>
      </div>

      {step === "setup" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Topic (for quizzes)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. quadratic equations, cell division"
              className="w-full max-w-md rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Grade level (optional)
            </label>
            <input
              type="text"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              placeholder="e.g. AP Chem, Calc II"
              className="w-full max-w-md rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-300 mb-3">Subject</p>
            <SubjectPicker value={subject} onChange={setSubject} />
          </div>
          <button
            type="button"
            onClick={() => setStep("pre")}
            className="rounded-xl bg-brand-500 px-6 py-3 font-medium text-white hover:bg-brand-400 transition"
          >
            Continue to pre-quiz
          </button>
        </div>
      )}

      {step === "pre" && (
        <div className="space-y-4">
          <SessionQuiz
            subject={subject}
            topic={topic || undefined}
            phase="pre"
            onComplete={(score, total) => {
              setPreScore(Math.round((score / total) * 100));
              setStep("study");
            }}
          />
          <button
            type="button"
            onClick={() => setStep("study")}
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            Skip pre-quiz →
          </button>
        </div>
      )}

      {step === "study" && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setStep("setup")}
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Change subject
          </button>
          <TutorChat
            subject={subject}
            gradeLevel={gradeLevel || undefined}
            onTranscriptChange={setTranscript}
            onEndSession={() => setStep("post")}
          />
        </div>
      )}

      {step === "post" && (
        <div className="space-y-6">
          <SessionQuiz
            subject={subject}
            topic={topic || undefined}
            phase="post"
            transcript={transcript}
            onComplete={(score, total) => {
              setPostScore(Math.round((score / total) * 100));
              setStep("done");
            }}
          />
        </div>
      )}

      {step === "done" && (
        <div className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-white">Session complete</h2>
          {(preScore !== null || postScore !== null) && (
            <p className="text-zinc-300">
              {preScore !== null && <>Pre-quiz: {preScore}%</>}
              {preScore !== null && postScore !== null && " → "}
              {postScore !== null && <>Post-quiz: {postScore}%</>}
              {preScore !== null && postScore !== null && postScore > preScore && (
                <span className="text-green-400"> (+{postScore - preScore} lift)</span>
              )}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/flashcards"
              className="rounded-xl bg-brand-500 px-5 py-2 text-sm text-white hover:bg-brand-400"
            >
              Review flashcards
            </Link>
            <button
              type="button"
              onClick={() => {
                setStep("setup");
                setPreScore(null);
                setPostScore(null);
                setTranscript("");
              }}
              className="rounded-xl border border-white/15 px-5 py-2 text-sm text-zinc-300 hover:bg-white/5"
            >
              New session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
