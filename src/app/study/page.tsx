"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SubjectPicker } from "@/components/SubjectPicker";
import { StudyTrackPicker } from "@/components/StudyTrackPicker";
import { DailyReviewBanner } from "@/components/DailyReviewBanner";
import { TutorChat } from "@/components/TutorChat";
import { SessionQuiz } from "@/components/SessionQuiz";
import { CopyShareLink } from "@/components/CopyShareLink";
import { TutorRequestForm } from "@/components/TutorRequestForm";
import { onSessionComplete } from "@/lib/session-complete";
import { trackEvent } from "@/lib/analytics";
import { SITE_URL } from "@/lib/site";
import type { StudyTrackId } from "@/lib/study-tracks";
import { getStudyTrack } from "@/lib/study-tracks";
import type { SubjectId } from "@/lib/types";

const SHARE_URL = `${SITE_URL}/study`;

type Step = "setup" | "pre" | "study" | "post" | "done";

export default function StudyPage() {
  const [trackId, setTrackId] = useState<StudyTrackId>("ap-calc-ab");
  const [subject, setSubject] = useState<SubjectId>("math");
  const [gradeLevel, setGradeLevel] = useState("AP Calculus AB");
  const [topic, setTopic] = useState("AP Calculus AB — derivatives and integrals");
  const [trackContext, setTrackContext] = useState(
    getStudyTrack("ap-calc-ab").tutorContext
  );
  const [step, setStep] = useState<Step>("setup");
  const [preScore, setPreScore] = useState<number | null>(null);
  const [postScore, setPostScore] = useState<number | null>(null);
  const [transcript, setTranscript] = useState("");
  const [cardsCreated, setCardsCreated] = useState<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    trackEvent("page_view", { page: "study" });
  }, []);

  useEffect(() => {
    if (step !== "done" || completedRef.current) return;
    completedRef.current = true;
    trackEvent("session_complete", {
      track: trackId,
      subject,
      preScore: preScore ?? -1,
      postScore: postScore ?? -1,
      lift:
        preScore !== null && postScore !== null ? postScore - preScore : -1,
    });
    onSessionComplete({ subject, topic, transcript }).then(({ cardsCreated: n }) =>
      setCardsCreated(n)
    );
  }, [step, subject, topic, transcript, trackId, preScore, postScore]);

  function applyTrack(id: StudyTrackId) {
    const track = getStudyTrack(id);
    setTrackId(id);
    trackEvent("track_selected", { track: id });
    if (id !== "custom") {
      setSubject(track.subject);
      setTopic(track.topic);
      setGradeLevel(track.gradeLevel);
      setTrackContext(track.tutorContext);
    } else {
      setTrackContext("");
    }
  }

  function startSession() {
    trackEvent("session_setup", { track: trackId, subject });
    setStep("pre");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <DailyReviewBanner />
      </div>

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
            <p className="text-sm font-medium text-zinc-300 mb-3">Study track</p>
            <StudyTrackPicker value={trackId} onChange={(t) => applyTrack(t.id)} />
          </div>
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
            onClick={startSession}
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
              const pct = Math.round((score / total) * 100);
              setPreScore(pct);
              trackEvent("pre_quiz_complete", { score: pct, track: trackId });
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
            topic={topic || undefined}
            trackContext={trackContext || undefined}
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
              const pct = Math.round((score / total) * 100);
              setPostScore(pct);
              trackEvent("post_quiz_complete", { score: pct, track: trackId });
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
          {cardsCreated !== null && cardsCreated > 0 && (
            <p className="text-sm text-brand-300">
              Generated {cardsCreated} flashcard{cardsCreated === 1 ? "" : "s"} from your chat.
            </p>
          )}
          {preScore !== null && postScore !== null && (
            <p className="text-xs text-zinc-500">
              Learning lift is saved on{" "}
              <Link href="/progress" className="text-brand-400 underline">
                Progress
              </Link>
              .
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/progress"
              className="rounded-xl bg-brand-500 px-5 py-2 text-sm text-white hover:bg-brand-400"
            >
              View progress
            </Link>
            <Link
              href="/flashcards"
              className="rounded-xl border border-white/15 px-5 py-2 text-sm text-zinc-300 hover:bg-white/5"
            >
              Review flashcards
            </Link>
            <CopyShareLink url={SHARE_URL} />
            <button
              type="button"
              onClick={() => {
                completedRef.current = false;
                setCardsCreated(null);
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
          <div className="mt-6 pt-6 border-t border-white/10 text-left max-w-md mx-auto">
            <p className="text-sm font-medium text-white mb-3">Still stuck?</p>
            <TutorRequestForm
              subject={subject}
              topic={topic || undefined}
              transcript={transcript}
              preScore={preScore}
              postScore={postScore}
              compact
            />
          </div>
        </div>
      )}
    </div>
  );
}
