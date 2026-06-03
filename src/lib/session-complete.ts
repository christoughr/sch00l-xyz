import {
  addFlashcards,
  defaultCardFields,
  mergeCloudFlashcards,
} from "./flashcards-local";
import { bumpMastery, loadProgress, saveProgress } from "./progress";
import { saveSessionMemory } from "./session-memory";
import type { SubjectId } from "./subject-ids";

export function transcriptToMessages(transcript: string) {
  return transcript
    .split("\n")
    .map((line) => {
      const m = line.match(/^(user|assistant):\s*(.*)$/i);
      if (!m) return null;
      return {
        role: m[1].toLowerCase() as "user" | "assistant",
        content: m[2],
      };
    })
    .filter((x): x is { role: "user" | "assistant"; content: string } => !!x);
}

function liftLabel(
  preScore: number | null | undefined,
  postScore: number | null | undefined,
  preSkipped?: boolean
): string | undefined {
  if (preSkipped || preScore == null || postScore == null) return undefined;
  const delta = postScore - preScore;
  return `${preScore}% → ${postScore}% (${delta >= 0 ? "+" : ""}${delta} lift)`;
}

async function persistSessionMemory(opts: {
  subject: SubjectId;
  topic?: string;
  transcript: string;
  preScore?: number | null;
  postScore?: number | null;
  preSkipped?: boolean;
}) {
  const label = liftLabel(opts.preScore, opts.postScore, opts.preSkipped);
  try {
    const res = await fetch("/api/session/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: opts.subject,
        topic: opts.topic,
        transcript: opts.transcript,
        preScore: opts.preScore ?? undefined,
        postScore: opts.postScore ?? undefined,
        liftLabel: label,
      }),
    });
    const data = await res.json();
    const summary =
      res.ok && typeof data.summary === "string"
        ? data.summary
        : `Session on ${opts.topic || opts.subject}.`;

    saveSessionMemory({
      subject: opts.subject,
      topic: opts.topic?.trim() || opts.subject,
      summary,
      liftLabel: label,
    });
  } catch {
    saveSessionMemory({
      subject: opts.subject,
      topic: opts.topic?.trim() || opts.subject,
      summary: `Studied ${opts.topic || opts.subject}.`,
      liftLabel: label,
    });
  }
}

/** After a full session: bump topic mastery, flashcards, and session memory. */
export async function onSessionComplete(opts: {
  subject: SubjectId;
  topic?: string;
  transcript: string;
  preScore?: number | null;
  postScore?: number | null;
  preSkipped?: boolean;
}): Promise<{ cardsCreated: number; error?: string }> {
  const { subject, topic, transcript, preScore, postScore, preSkipped } = opts;

  if (topic?.trim()) {
    const progress = bumpMastery(loadProgress(), subject, topic.trim());
    saveProgress(progress);
  }

  void persistSessionMemory({
    subject,
    topic,
    transcript,
    preScore,
    postScore,
    preSkipped,
  });

  const messages = transcriptToMessages(transcript);
  const userCount = messages.filter((m) => m.role === "user").length;
  if (userCount < 1) return { cardsCreated: 0 };

  const res = await fetch("/api/flashcards/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, messages }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      cardsCreated: 0,
      error:
        (data as { error?: string }).error ??
        "Could not generate flashcards. Saved locally otherwise.",
    };
  }
  if (!Array.isArray(data.cards) || data.cards.length === 0) {
    return { cardsCreated: 0 };
  }

  if (data.mode === "cloud") {
    mergeCloudFlashcards(data.cards);
    if (data.cloudSaveFailed) {
      return {
        cardsCreated: data.cards.length,
        error: "Cards generated but cloud save failed — saved on this device.",
      };
    }
    return { cardsCreated: data.cards.length };
  }

  if (data.cards.length) {
    const base = defaultCardFields(subject);
    addFlashcards(
      data.cards.map((c: { front: string; back: string }) => ({
        ...base,
        front: c.front,
        back: c.back,
      }))
    );
  }

  return { cardsCreated: data.cards.length };
}
