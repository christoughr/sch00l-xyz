"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Swords, Trophy } from "lucide-react";

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
    roomCode: string;
    status: string;
    homeworkMode: boolean;
    studyTrackId: string;
  };
  questions: Question[];
  participants: Participant[];
  isTeacher: boolean;
};

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
  const [qIndex, setQIndex] = useState(0);
  const [answerFeedback, setAnswerFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const questionStart = useRef(Date.now());

  useEffect(() => {
    params.then((p) => setCode(p.code.toUpperCase()));
  }, [params]);

  const poll = useCallback(async () => {
    if (!code) return;
    const res = await fetch(`/api/battles/${code}`);
    const data = await res.json();
    if (res.ok) {
      setState(data);
      if (data.participants?.some((p: Participant) => p.displayName === displayName)) {
        setJoined(true);
      }
    }
  }, [code, displayName]);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    poll().finally(() => setLoading(false));
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [code, poll]);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start");
    } finally {
      setStarting(false);
    }
  }

  async function submitAnswer(choiceIndex: number) {
    if (!state || !joined) return;
    const q = state.questions[qIndex];
    const elapsedMs = Date.now() - questionStart.current;
    setAnswerFeedback(null);
    try {
      const res = await fetch(`/api/battles/${code}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          questionId: q.id,
          choiceIndex,
          elapsedMs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit");
      setAnswerFeedback(
        data.correct ? `Correct! +${data.points} pts` : "Incorrect"
      );
      if (qIndex < state.questions.length - 1) {
        setTimeout(() => {
          setQIndex((i) => i + 1);
          questionStart.current = Date.now();
          setAnswerFeedback(null);
        }, 1200);
      }
      await poll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit");
    }
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
  const currentQ = questions[qIndex];

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
        {battle.homeworkMode && (
          <span className="text-xs text-amber-300">homework mode</span>
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
          {isTeacher && battle.status === "lobby" && (
            <button
              type="button"
              onClick={startBattle}
              disabled={starting}
              className="mb-6 rounded-lg bg-brand-500 px-5 py-2 text-white hover:bg-brand-400 disabled:opacity-50"
            >
              {starting ? "Starting…" : "Start battle (teacher)"}
            </button>
          )}

          {active && currentQ && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-6">
              <p className="text-xs text-zinc-500 mb-2">
                Q{qIndex + 1} / {questions.length}
              </p>
              <p className="text-white mb-4">{currentQ.prompt}</p>
              <ul className="space-y-2">
                {currentQ.choices.map((c, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => submitAnswer(i)}
                      disabled={!!answerFeedback}
                      className="w-full text-left rounded-lg border border-white/10 bg-surface-900 px-4 py-3 text-sm text-zinc-300 hover:border-brand-400/50 disabled:opacity-60"
                    >
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
              {answerFeedback && (
                <p className="mt-3 text-sm text-brand-300">{answerFeedback}</p>
              )}
            </div>
          )}

          {!active && battle.status === "lobby" && (
            <p className="text-sm text-zinc-400 mb-6">
              Waiting for teacher to start…
            </p>
          )}
        </>
      )}

      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-brand-400" />
          Leaderboard
          <span className="text-xs font-normal text-zinc-500">(updates every 2s)</span>
        </h2>
        {participants.length === 0 ? (
          <p className="text-sm text-zinc-500">No players yet.</p>
        ) : (
          <ol className="space-y-1">
            {participants.map((p, i) => (
              <li
                key={p.displayName}
                className="flex justify-between text-sm px-2 py-1.5 rounded-lg even:bg-white/5"
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
