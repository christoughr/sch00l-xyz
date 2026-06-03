"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Swords, Trophy, Users } from "lucide-react";
import {
  broadcastBattleEnd,
  broadcastQuestion,
  broadcastResult,
  broadcastTimeUp,
  subscribeBattleEvents,
  subscribeLeaderboard,
  trackPresence,
  type BattleQuestionPayload,
  type BattleResultPayload,
} from "@/lib/battle-realtime";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type Question = {
  id: string;
  ord: number;
  prompt: string;
  choices: string[];
  correctIndex?: number;
};

type Participant = {
  displayName: string;
  totalScore: number;
};

type BattleState = {
  battle: {
    id?: string;
    battleId?: string;
    roomCode: string;
    status: string;
    homeworkMode: boolean;
    studyTrackId: string;
  };
  questions: Question[];
  participants: Participant[];
  isTeacher: boolean;
};

const TIMER_SEC = 20;

export default function BattlePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const [code, setCode] = useState("");
  const [state, setState] = useState<BattleState | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [liveQ, setLiveQ] = useState<BattleQuestionPayload | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SEC);
  const [answerFeedback, setAnswerFeedback] = useState<string | null>(null);
  const [resultReveal, setResultReveal] = useState<BattleResultPayload | null>(
    null
  );
  const [responseCount, setResponseCount] = useState(0);
  const [presenceNames, setPresenceNames] = useState<string[]>([]);
  const [battleEnded, setBattleEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const questionStart = useRef(Date.now());
  const answersThisQ = useRef<BattleResultPayload["scores"]>([]);
  const closedQRef = useRef<string | null>(null);
  const realtimeReady = isSupabaseConfigured();

  useEffect(() => {
    params.then((p) => setCode(p.code.toUpperCase()));
  }, [params]);

  const poll = useCallback(async () => {
    if (!code) return;
    const res = await fetch(`/api/battles/${code}`);
    const data = await res.json();
    if (res.ok) {
      setState(data);
      if (
        data.participants?.some(
          (p: Participant) => p.displayName === displayName
        )
      ) {
        setJoined(true);
      }
    }
  }, [code, displayName]);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    poll().finally(() => setLoading(false));
  }, [code, poll]);

  useEffect(() => {
    if (!code || !realtimeReady) return;

    const ch = subscribeBattleEvents(code, {
      onQuestion: (q) => {
        setLiveQ(q);
        setQIndex((q.ord ?? 1) - 1);
        setTimeLeft(q.timeLimitSec ?? TIMER_SEC);
        setAnswerFeedback(null);
        setResultReveal(null);
        setResponseCount(0);
        answersThisQ.current = [];
        questionStart.current = Date.now();
      },
      onAnswer: () => {
        setResponseCount((c) => c + 1);
      },
      onTimeUp: () => {
        setAnswerFeedback("Time's up — waiting for results…");
      },
      onResult: (r) => {
        setResultReveal(r);
      },
      onBattleEnd: () => {
        setBattleEnded(true);
        setLiveQ(null);
        void poll();
      },
      onPresence: setPresenceNames,
    });

    if (!ch) return;

    void ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED" && joined && displayName) {
        await trackPresence(ch, displayName, displayName);
      }
    });

    return () => {
      void ch.unsubscribe();
    };
  }, [code, joined, displayName, realtimeReady, poll]);

  const battleId = state?.battle?.id ?? state?.battle?.battleId;

  useEffect(() => {
    if (!battleId || !realtimeReady) return;
    const ch = subscribeLeaderboard(battleId, () => void poll());
    return () => {
      ch?.unsubscribe();
    };
  }, [battleId, realtimeReady, poll]);

  async function joinBattle(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setJoining(true);
    setError(null);
    try {
      const res = await fetch(`/api/battles/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not join");
      setJoined(true);
      await poll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join");
    } finally {
      setJoining(false);
    }
  }

  async function startBattle() {
    setStarting(true);
    try {
      const res = await fetch(`/api/battles/${code}/start`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start");
      await poll();
      const first = state?.questions[0];
      if (first && realtimeReady) {
        await launchQuestion(first, 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start");
    } finally {
      setStarting(false);
    }
  }

  async function launchQuestion(q: Question, index: number) {
    const payload: BattleQuestionPayload = {
      id: q.id,
      ord: q.ord,
      prompt: q.prompt,
      choices: q.choices,
      correctIndex: q.correctIndex,
      timeLimitSec: TIMER_SEC,
    };
    setLiveQ(payload);
    setQIndex(index);
    setTimeLeft(TIMER_SEC);
    setResponseCount(0);
    answersThisQ.current = [];
    closedQRef.current = null;
    questionStart.current = Date.now();
    if (realtimeReady) await broadcastQuestion(code, payload);
  }

  async function closeQuestionAsTeacher() {
    if (!liveQ || !state) return;
    const correctIndex = liveQ.correctIndex ?? 0;
    const result: BattleResultPayload = {
      questionId: liveQ.id,
      correctIndex,
      scores: answersThisQ.current,
    };
    if (realtimeReady) await broadcastResult(code, result);
    setResultReveal(result);
  }

  useEffect(() => {
    if (!liveQ) return;
    if (timeLeft <= 0) {
      if (state?.isTeacher && closedQRef.current !== liveQ.id) {
        closedQRef.current = liveQ.id;
        void broadcastTimeUp(code, liveQ.id);
        void closeQuestionAsTeacher();
      }
      return;
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [liveQ, timeLeft, code, state?.isTeacher]);

  async function submitAnswer(choiceIndex: number) {
    if (!state || !joined || !liveQ) return;
    const elapsedMs = Date.now() - questionStart.current;
    setAnswerFeedback(null);
    try {
      const res = await fetch(`/api/battles/${code}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          questionId: liveQ.id,
          choiceIndex,
          elapsedMs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit");
      setAnswerFeedback(
        data.correct ? `Correct! +${data.points} pts` : "Incorrect"
      );
      await poll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit");
    }
  }

  async function endBattle() {
    await fetch(`/api/battles/${code}/end`, { method: "POST" }).catch(() => {});
    if (realtimeReady) await broadcastBattleEnd(code);
    setBattleEnded(true);
    await poll();
  }

  if (loading && !state) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (!state?.battle) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-red-400">Battle not found.</p>
        <Link href="/join" className="mt-4 inline-block text-brand-400 hover:underline">
          Join a class →
        </Link>
      </div>
    );
  }

  const { battle, questions, participants, isTeacher } = state;
  const active = battle.status === "active";
  const lobby = battle.status === "lobby";
  const currentQ = liveQ ?? questions[qIndex];
  const studentCount = Math.max(
    participants.length,
    presenceNames.length
  );
  const canStart = studentCount >= 1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2 mb-6">
        <Swords className="h-6 w-6 text-brand-400" />
        <h1 className="text-2xl font-bold text-white font-mono">
          {battle.roomCode}
        </h1>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-400 capitalize">
          {battle.status}
        </span>
        {realtimeReady && (
          <span className="text-xs text-emerald-400">live</span>
        )}
      </div>

      {!joined ? (
        <form
          onSubmit={joinBattle}
          className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4"
        >
          <p className="text-sm text-zinc-400">Enter a display name to join.</p>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            maxLength={40}
            className="w-full rounded-lg border border-white/10 bg-surface-900 px-4 py-3 text-white focus:border-brand-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={joining || !displayName.trim()}
            className="rounded-lg bg-brand-500 px-5 py-2 text-white hover:bg-brand-400 disabled:opacity-50"
          >
            {joining ? "Joining…" : "Join battle"}
          </button>
        </form>
      ) : (
        <>
          {lobby && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6">
              <p className="text-sm text-zinc-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {isTeacher
                  ? "Lobby — students joining"
                  : "Waiting for teacher to start the battle…"}
              </p>
              {(presenceNames.length > 0 || participants.length > 0) && (
                <ul className="mt-3 text-sm text-zinc-300 space-y-1">
                  {(presenceNames.length
                    ? presenceNames
                    : participants.map((p) => p.displayName)
                  ).map((name) => (
                    <li key={name}>• {name}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {isTeacher && lobby && (
            <button
              type="button"
              onClick={startBattle}
              disabled={starting || !canStart}
              className="mb-6 rounded-lg bg-brand-500 px-5 py-2 text-white hover:bg-brand-400 disabled:opacity-50"
              title={!canStart ? "Need at least one student" : undefined}
            >
              {starting
                ? "Starting…"
                : `Start battle (${studentCount} in lobby)`}
            </button>
          )}

          {isTeacher && active && (
            <div className="mb-6 space-y-3">
              <p className="text-sm text-zinc-400">Teacher controls</p>
              <div className="flex flex-wrap gap-2">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => launchQuestion(q, i)}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:border-brand-400/50"
                  >
                    Launch Q{i + 1}
                  </button>
                ))}
              </div>
              {liveQ && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-brand-300">
                    {timeLeft}s
                  </span>
                  <span className="text-zinc-500">
                    {responseCount} answers
                  </span>
                  <button
                    type="button"
                    onClick={closeQuestionAsTeacher}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Reveal results
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={endBattle}
                className="rounded-lg border border-red-400/30 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
              >
                End battle
              </button>
            </div>
          )}

          {active && currentQ && !battleEnded && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-6">
              <div className="flex justify-between text-xs text-zinc-500 mb-2">
                <span>
                  Q{(liveQ?.ord ?? qIndex + 1)} / {questions.length}
                </span>
                {liveQ && (
                  <span className="font-mono text-brand-400">{timeLeft}s</span>
                )}
              </div>
              <div
                className="h-1 bg-white/10 rounded mb-4 overflow-hidden"
                aria-hidden
              >
                <div
                  className="h-full bg-brand-500 transition-all duration-1000"
                  style={{
                    width: `${(timeLeft / TIMER_SEC) * 100}%`,
                  }}
                />
              </div>
              <p className="text-white mb-4">{currentQ.prompt}</p>
              <ul className="space-y-2">
                {currentQ.choices.map((c, i) => {
                  const isCorrect =
                    resultReveal?.correctIndex === i;
                  const isWrong =
                    resultReveal &&
                    answerFeedback?.includes("Incorrect") &&
                    resultReveal.correctIndex !== i;
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => submitAnswer(i)}
                        disabled={
                          !!answerFeedback ||
                          !!resultReveal ||
                          state.isTeacher
                        }
                        className={`w-full text-left rounded-lg border px-4 py-3 text-sm disabled:opacity-60 ${
                          isCorrect
                            ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200"
                            : isWrong
                              ? "border-red-400/30 bg-red-500/10 text-red-200"
                              : "border-white/10 bg-surface-900 text-zinc-300 hover:border-brand-400/50"
                        }`}
                      >
                        {c}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {answerFeedback && (
                <p className="mt-3 text-sm text-brand-300">{answerFeedback}</p>
              )}
            </div>
          )}

          {battleEnded && (
            <p className="text-sm text-brand-300 mb-4">Battle ended — final scores below.</p>
          )}
        </>
      )}

      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-brand-400" />
          Leaderboard
          {realtimeReady && (
            <span className="text-xs font-normal text-emerald-400/80">
              live
            </span>
          )}
        </h2>
        {participants.length === 0 ? (
          <p className="text-sm text-zinc-500">No players yet.</p>
        ) : (
          <ol className="space-y-1">
            {participants.slice(0, battleEnded ? 20 : 5).map((p, i) => (
              <li
                key={p.displayName}
                className="flex justify-between text-sm px-2 py-1.5 rounded-lg even:bg-white/5 transition-transform duration-300"
              >
                <span className="text-zinc-300">
                  {i + 1}. {p.displayName}
                  {p.displayName === displayName && (
                    <span className="ml-1 text-brand-400">(you)</span>
                  )}
                </span>
                <span className="font-mono text-brand-300">{p.totalScore}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {error && (
        <p className="mt-4 text-sm text-amber-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
