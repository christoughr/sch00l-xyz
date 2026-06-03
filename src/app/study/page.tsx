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
import { StudyPersonalizationBanner } from "@/components/StudyPersonalizationBanner";
import { ClassDiscussionBanner } from "@/components/ClassDiscussionBanner";
import { StudyFeatureStrip } from "@/components/StudyFeatureStrip";
import { onSessionComplete } from "@/lib/session-complete";
import { trackEvent } from "@/lib/analytics";
import {
  canStartSession,
  freeTierLimitMessage,
  isProUser,
  recordSessionStart,
  sessionsRemainingToday,
  unrecordSessionStart,
} from "@/lib/free-tier";
import {
  rotateStudySessionId,
  clearStudySessionId,
} from "@/lib/study-session-id";
import { SITE_URL } from "@/lib/site";
import type { StudyTrackId } from "@/lib/study-tracks";
import { getStudyTrack } from "@/lib/study-tracks";
import type { SubjectId } from "@/lib/types";
import { tutorRateRange } from "@/lib/tutor-pricing";

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
  const [sessionId, setSessionId] = useState("");
  const [preSkipped, setPreSkipped] = useState(false);
  const [preScore, setPreScore] = useState<number | null>(null);
  const [postScore, setPostScore] = useState<number | null>(null);
  const [transcript, setTranscript] = useState("");
  const [cardsCreated, setCardsCreated] = useState<number | null>(null);
  const [setupError, setSetupError] = useState("");
  const [limitHit, setLimitHit] = useState(false);
  const [sessionCounted, setSessionCounted] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardsError, setCardsError] = useState<string | null>(null);
  const completedRef = useRef(false);
  const remaining = sessionsRemainingToday();

  useEffect(() => {
    trackEvent("page_view", { page: "study" });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const trackParam = params.get("track");
    if (!trackParam) return;
    const t = getStudyTrack(trackParam);
    if (t.id === "custom" && trackParam !== "custom") return;
    setTrackId(t.id);
    setSubject(t.subject as SubjectId);
    setGradeLevel(t.gradeLevel);
    setTopic(t.topic);
    setTrackContext(t.tutorContext);
  }, []);

  useEffect(() => {
    if (step !== "done" || completedRef.current) return;
    completedRef.current = true;
    trackEvent("session_complete", {
      track: trackId,
      subject,
      preScore: preScore ?? -1,
      postScore: postScore ?? -1,
      preSkipped: preSkipped ? 1 : 0,
      lift:
        preScore !== null && postScore !== null && !preSkipped
          ? postScore - preScore
          : -1,
    });
    setCardsLoading(true);
    setCardsError(null);
    onSessionComplete({
      subject,
      topic,
      transcript,
      preScore,
      postScore,
      preSkipped,
    }).then(
      ({ cardsCreated: n, error }) => {
        setCardsCreated(n);
        setCardsError(error ?? null);
        setCardsLoading(false);
      }
    );
  }, [
    step,
    subject,
    topic,
    transcript,
    trackId,
    preScore,
    postScore,
    preSkipped,
  ]);

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
      setSubject("other");
      setTopic("");
      setGradeLevel("");
      setTrackContext("");
    }
  }

  function startSession() {
    setSetupError("");
    if (!topic.trim()) {
      setSetupError("Enter a topic so quizzes and the tutor stay focused.");
      return;
    }
    if (!canStartSession()) {
      setLimitHit(true);
      return;
    }
    const sid = rotateStudySessionId();
    setSessionId(sid);
    setPreSkipped(false);
    setPreScore(null);
    setPostScore(null);
    trackEvent("session_setup", { track: trackId, subject });
    setStep("pre");
  }

  function liftDelta(): number | null {
    if (preSkipped || preScore === null || postScore === null) return null;
    return postScore - preScore;
  }

  const delta = liftDelta();

  function enterStudyPhase() {
    if (!sessionCounted) {
      recordSessionStart();
      setSessionCounted(true);
    }
    setStep("study");
  }

  function abandonToSetup() {
    if (
      !confirm(
        "Leave this session? Progress in this quiz/chat will be lost."
      )
    ) {
      return;
    }
    if (sessionCounted) {
      unrecordSessionStart();
      setSessionCounted(false);
    }
    setStep("setup");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 space-y-4">
        <DailyReviewBanner />
        <ClassDiscussionBanner />
        <StudyFeatureStrip />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Study session</h1>
        <p className="mt-2 text-zinc-400">
          Pre-quiz → tutor → post-quiz → flashcards. Built for measurable learning
          lift.
        </p>
        {isProUser() ? (
          <p className="mt-2 text-xs text-brand-300">Pro — unlimited AI sessions</p>
        ) : (
          <p className="mt-2 text-xs text-zinc-500">
            {remaining} free AI session
            {remaining === 1 ? "" : "s"} left today ·{" "}
            <Link href="/pricing" className="text-brand-400 underline">
              Go Pro
            </Link>
          </p>
        )}
      </div>

      {limitHit && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          {freeTierLimitMessage()}{" "}
          <Link href="/pricing" className="underline text-white">
            View pricing
          </Link>
        </div>
      )}

      {step === "setup" && (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-zinc-300 mb-3">Study track</p>
            <StudyTrackPicker value={trackId} onChange={(t) => applyTrack(t.id)} />
          </div>
          <div>
            <label htmlFor="study-topic" className="block text-sm font-medium text-zinc-300 mb-2">
              Topic (for quizzes)
            </label>
            <input
              id="study-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. quadratic equations, cell division"
              className="w-full max-w-md rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            />
          </div>
          <div>
            <label htmlFor="study-grade" className="block text-sm font-medium text-zinc-300 mb-2">
              Grade level (optional)
            </label>
            <input
              id="study-grade"
              type="text"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              placeholder="e.g. AP Chem, Calc II"
              className="w-full max-w-md rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-300 mb-3">Subject</p>
            <SubjectPicker value={subject} onChange={setSubject} />
          </div>
          {setupError && (
            <p className="text-sm text-red-400">{setupError}</p>
          )}
          <button
            type="button"
            onClick={startSession}
            disabled={!canStartSession()}
            className="rounded-xl bg-brand-500 px-6 py-3 font-medium text-white hover:bg-brand-400 transition focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {canStartSession()
              ? "Continue to pre-quiz"
              : "Daily limit reached — upgrade to Pro"}
          </button>
        </div>
      )}

      {step === "pre" && (
        <div className="space-y-4">
          <SessionQuiz
            subject={subject}
            topic={topic || undefined}
            phase="pre"
            sessionId={sessionId}
            onComplete={(score, total) => {
              const pct = Math.round((score / total) * 100);
              setPreScore(pct);
              setPreSkipped(false);
              trackEvent("pre_quiz_complete", { score: pct, track: trackId });
              enterStudyPhase();
            }}
          />
          <button
            type="button"
            onClick={() => {
              setPreSkipped(true);
              setPreScore(null);
              trackEvent("pre_quiz_skipped", { track: trackId });
              enterStudyPhase();
            }}
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            Skip pre-quiz (no learning lift) →
          </button>
        </div>
      )}

      {step === "study" && (
        <div className="space-y-4">
          <StudyPersonalizationBanner subject={subject} preScore={preScore} />
          <button
            type="button"
            onClick={abandonToSetup}
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Back to setup
          </button>
          <TutorChat
            subject={subject}
            gradeLevel={gradeLevel || undefined}
            topic={topic || undefined}
            trackContext={trackContext || undefined}
            preScoreToday={preScore}
            onTranscriptChange={setTranscript}
            onEndSession={() => setStep("post")}
            allowEndWithoutChat
          />
        </div>
      )}

      {step === "post" && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setStep("study")}
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Back to tutor
          </button>
          <SessionQuiz
            subject={subject}
            topic={topic || undefined}
            phase="post"
            transcript={transcript}
            sessionId={sessionId}
            preScoreToday={preScore}
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
          {(preScore !== null || postScore !== null || preSkipped) && (
            <p className="text-zinc-300">
              {preSkipped && postScore !== null && (
                <>Post-quiz: {postScore}% (pre-quiz skipped)</>
              )}
              {!preSkipped && preScore !== null && <>Pre-quiz: {preScore}%</>}
              {!preSkipped && preScore !== null && postScore !== null && " → "}
              {!preSkipped && postScore !== null && <>Post-quiz: {postScore}%</>}
              {delta !== null && (
                <span
                  className={
                    delta > 0
                      ? " text-green-400"
                      : delta < 0
                        ? " text-red-400"
                        : " text-zinc-400"
                  }
                >
                  {" "}
                  ({delta >= 0 ? "+" : ""}
                  {delta} lift)
                </span>
              )}
            </p>
          )}
          {cardsLoading && (
            <p className="text-sm text-zinc-400">Generating flashcards from your chat…</p>
          )}
          {cardsError && (
            <p className="text-sm text-amber-300">{cardsError}</p>
          )}
          {!cardsLoading && cardsCreated !== null && cardsCreated > 0 && (
            <p className="text-sm text-brand-300">
              Generated {cardsCreated} flashcard{cardsCreated === 1 ? "" : "s"} from your chat.
            </p>
          )}
          {!cardsLoading &&
            cardsCreated === 0 &&
            !cardsError &&
            transcript.includes("user:") && (
              <p className="text-sm text-zinc-500">
                No flashcards generated — try chatting more next session.
              </p>
            )}
          {delta !== null && (
            <p className="text-xs text-zinc-500">
              Learning lift saved on{" "}
              <Link href="/progress" className="text-brand-400 underline">
                Progress
              </Link>
              .
            </p>
          )}
          {preSkipped && (
            <p className="text-xs text-zinc-500">
              Complete the pre-quiz next time to measure learning lift.
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
            <CopyShareLink
              url={SHARE_URL}
              message={
                delta !== null && preScore !== null && postScore !== null
                  ? `I studied on sch00l.ai — pre-quiz ${preScore}% → post-quiz ${postScore}% (${delta >= 0 ? "+" : ""}${delta} lift). Socratic AI tutor + flashcards. Try it: ${SHARE_URL}`
                  : `Try sch00l.ai — Socratic AI tutor that measures learning lift (pre/post quiz): ${SHARE_URL}`
              }
            />
            <button
              type="button"
              onClick={() => {
                completedRef.current = false;
                setCardsCreated(null);
                setLimitHit(false);
                setSessionCounted(false);
                setCardsLoading(false);
                setCardsError(null);
                setPreSkipped(false);
                setStep("setup");
                setPreScore(null);
                setPostScore(null);
                setTranscript("");
                clearStudySessionId();
                setSessionId("");
              }}
              className="rounded-xl border border-white/15 px-5 py-2 text-sm text-zinc-300 hover:bg-white/5"
            >
              New session
            </button>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-left max-w-lg mx-auto w-full">
            <p className="text-sm font-medium text-white mb-1">Still stuck?</p>
            <p className="text-xs text-zinc-500 mb-3">
              Human tutors {formatUsdLink(subject)} — AI summary included.{" "}
              <Link href="/tutors" className="text-brand-400 underline">
                Full request form
              </Link>
            </p>
            <TutorRequestForm
              subject={subject}
              topic={topic || undefined}
              transcript={transcript}
              preScore={preScore}
              postScore={postScore}
              rateRange={tutorRateRange(subject)}
              compact
            />
          </div>
        </div>
      )}
    </div>
  );
}

function formatUsdLink(subject: SubjectId) {
  const r = tutorRateRange(subject);
  return (
    <Link href="/tutors" className="text-brand-400 underline">
      ${r.min}–${r.max}/hr
    </Link>
  );
}
