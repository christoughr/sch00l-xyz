import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type BattleQuestionPayload = {
  id: string;
  ord: number;
  prompt: string;
  choices: string[];
  correctIndex?: number;
  timeLimitSec?: number;
};

export type BattleAnswerPayload = {
  displayName: string;
  questionId: string;
  choiceIndex: number;
  elapsedMs: number;
};

export type BattleResultPayload = {
  questionId: string;
  correctIndex: number;
  scores: { displayName: string; correct: boolean; points: number }[];
};

export function battleChannelName(code: string): string {
  return `battle:${code.toUpperCase()}`;
}

export function getBattleChannel(code: string): RealtimeChannel | null {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  if (!supabase) return null;
  return supabase.channel(battleChannelName(code), {
    config: { presence: { key: code } },
  });
}

export async function broadcastQuestion(
  code: string,
  question: BattleQuestionPayload
): Promise<void> {
  const ch = getBattleChannel(code);
  if (!ch) return;
  await ch.subscribe();
  await ch.send({
    type: "broadcast",
    event: "question",
    payload: question,
  });
}

export async function broadcastTimeUp(code: string, questionId: string): Promise<void> {
  const ch = getBattleChannel(code);
  if (!ch) return;
  await ch.subscribe();
  await ch.send({
    type: "broadcast",
    event: "time_up",
    payload: { questionId },
  });
}

export async function broadcastResult(
  code: string,
  result: BattleResultPayload
): Promise<void> {
  const ch = getBattleChannel(code);
  if (!ch) return;
  await ch.subscribe();
  await ch.send({
    type: "broadcast",
    event: "result",
    payload: result,
  });
}

export async function broadcastBattleEnd(code: string): Promise<void> {
  const ch = getBattleChannel(code);
  if (!ch) return;
  await ch.subscribe();
  await ch.send({
    type: "broadcast",
    event: "battle_end",
    payload: {},
  });
}

export async function broadcastAnswer(
  code: string,
  answer: BattleAnswerPayload
): Promise<void> {
  const ch = getBattleChannel(code);
  if (!ch) return;
  await ch.subscribe();
  await ch.send({
    type: "broadcast",
    event: "answer",
    payload: answer,
  });
}

export function subscribeBattleEvents(
  code: string,
  handlers: {
    onQuestion?: (q: BattleQuestionPayload) => void;
    onAnswer?: (a: BattleAnswerPayload) => void;
    onTimeUp?: (questionId: string) => void;
    onResult?: (r: BattleResultPayload) => void;
    onBattleEnd?: () => void;
    onPresence?: (names: string[]) => void;
  }
): RealtimeChannel | null {
  const ch = getBattleChannel(code);
  if (!ch) return null;

  ch.on("broadcast", { event: "question" }, ({ payload }) => {
    handlers.onQuestion?.(payload as BattleQuestionPayload);
  })
    .on("broadcast", { event: "answer" }, ({ payload }) => {
      handlers.onAnswer?.(payload as BattleAnswerPayload);
    })
    .on("broadcast", { event: "time_up" }, ({ payload }) => {
      const p = payload as { questionId: string };
      handlers.onTimeUp?.(p.questionId);
    })
    .on("broadcast", { event: "result" }, ({ payload }) => {
      handlers.onResult?.(payload as BattleResultPayload);
    })
    .on("broadcast", { event: "battle_end" }, () => {
      handlers.onBattleEnd?.();
    })
    .on("presence", { event: "sync" }, () => {
      const state = ch.presenceState();
      const names = Object.values(state)
        .flat()
        .map((p) => (p as { name?: string }).name)
        .filter((n): n is string => !!n);
      handlers.onPresence?.(names);
    });

  return ch;
}

export async function trackPresence(
  channel: RealtimeChannel,
  displayName: string,
  userKey: string
): Promise<void> {
  await channel.track({ name: displayName, key: userKey });
}

export function subscribeLeaderboard(
  battleId: string,
  onUpdate: () => void
): RealtimeChannel | null {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  if (!supabase) return null;

  return supabase
    .channel(`leaderboard:${battleId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "battle_participants",
        filter: `battle_id=eq.${battleId}`,
      },
      () => onUpdate()
    )
    .subscribe();
}
