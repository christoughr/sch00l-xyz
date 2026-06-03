import {
  addFlashcards,
  defaultCardFields,
  mergeCloudFlashcards,
} from "./flashcards-local";
import { bumpMastery, loadProgress, saveProgress } from "./progress";
import type { SubjectId } from "./types";

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

/** After a full session: bump topic mastery and generate flashcards from chat. */
export async function onSessionComplete(opts: {
  subject: SubjectId;
  topic?: string;
  transcript: string;
}): Promise<{ cardsCreated: number; error?: string }> {
  const { subject, topic, transcript } = opts;

  if (topic?.trim()) {
    const progress = bumpMastery(loadProgress(), subject, topic.trim());
    saveProgress(progress);
  }

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
