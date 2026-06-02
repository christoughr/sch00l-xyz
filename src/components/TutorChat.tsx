"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, Sparkles, Loader2, Layers, LogOut } from "lucide-react";
import type { ChatMessage, SubjectId } from "@/lib/types";
import { getSubject } from "@/lib/subjects";
import {
  loadProgress,
  recordStudyActivity,
  saveProgress,
} from "@/lib/progress";
import {
  addFlashcards,
  defaultCardFields,
} from "@/lib/flashcards-local";
import { useAuth } from "./AuthProvider";

function uid() {
  return crypto.randomUUID();
}

const WELCOME = (subject: string) =>
  `Hey — I'm your **sch00l** tutor for ${subject}. I guide; I don't do your homework for you.

What are you working on right now? Be specific (topic + where you're stuck).`;

export function TutorChat({
  subject,
  gradeLevel,
  onTranscriptChange,
  onEndSession,
}: {
  subject: SubjectId;
  gradeLevel?: string;
  onTranscriptChange?: (t: string) => void;
  onEndSession?: () => void;
}) {
  const sub = getSubject(subject);
  const { user, syncProgress } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingCards, setGeneratingCards] = useState(false);
  const [cardsMsg, setCardsMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<"demo" | "live" | null>(null);
  const [sessionStart] = useState(() => Date.now());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: uid(),
        role: "assistant",
        content: WELCOME(sub.label),
        createdAt: new Date().toISOString(),
      },
    ]);
  }, [subject, sub.label]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const t = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
    onTranscriptChange?.(t);
  }, [messages, onTranscriptChange]);

  const persistSession = useCallback(async () => {
    const userMsgs = messages.filter((m) => m.role === "user").length;
    if (userMsgs === 0) return;
    const minutes = Math.max(1, Math.round((Date.now() - sessionStart) / 60000));
    const progress = recordStudyActivity(loadProgress(), {
      subject,
      minutes,
      messageCount: messages.length,
    });
    saveProgress(progress);
    if (user) {
      await fetch("/api/progress/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progress),
      });
      await syncProgress();
    }
  }, [messages, sessionStart, subject, user, syncProgress]);

  useEffect(() => {
    const onLeave = () => {
      persistSession();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("beforeunload", onLeave);
      persistSession();
    };
  }, [persistSession]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          gradeLevel,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");

      if (data.mode) setMode(data.mode);

      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: data.message.content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content:
            "Something went wrong on my end. Try again in a moment — or check that your API key is set in `.env.local`.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function generateFlashcards() {
    const userMsgs = messages.filter((m) => m.role === "user").length;
    if (userMsgs < 1) {
      setCardsMsg("Chat a bit first — then generate cards from your session.");
      return;
    }

    setGeneratingCards(true);
    setCardsMsg(null);

    try {
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.mode === "local" && data.cards) {
        const base = defaultCardFields(subject);
        addFlashcards(
          data.cards.map((c: { front: string; back: string }) => ({
            ...base,
            front: c.front,
            back: c.back,
          }))
        );
      }

      const count = Array.isArray(data.cards) ? data.cards.length : 0;
      setCardsMsg(`Created ${count} flashcards. Review them in Cards.`);
    } catch {
      setCardsMsg("Could not generate flashcards. Try again.");
    } finally {
      setGeneratingCards(false);
    }
  }

  async function endSession() {
    await persistSession();
    onEndSession?.();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex h-[min(70vh,640px)] flex-col rounded-2xl border border-white/10 bg-surface-800/50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-400" />
          <span className="text-sm font-medium text-white">
            {sub.emoji} {sub.label} tutor
          </span>
        </div>
        <div className="flex items-center gap-2">
          {mode === "demo" && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-200">
              Demo
            </span>
          )}
          <button
            type="button"
            onClick={generateFlashcards}
            disabled={generatingCards}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-50"
          >
            {generatingCards ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Layers className="h-3 w-3" />
            )}
            Cards
          </button>
          {onEndSession && (
            <button
              type="button"
              onClick={endSession}
              className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/15"
            >
              <LogOut className="h-3 w-3" />
              End → quiz
            </button>
          )}
        </div>
      </div>

      {cardsMsg && (
        <p className="px-4 py-2 text-xs text-brand-300 border-b border-white/5">
          {cardsMsg}{" "}
          <Link href="/flashcards" className="underline">
            Open deck
          </Link>
        </p>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-brand-500 text-white"
                  : "bg-white/5 text-zinc-200 border border-white/10"
              }`}
            >
              {m.content.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={i}>{part.slice(2, -2)}</strong>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking with you…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask a question or explain where you're stuck…"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400/50"
          />
          <button
            type="button"
            onClick={send}
            disabled={loading || !input.trim()}
            className="self-end rounded-xl bg-brand-500 p-3 text-white transition hover:bg-brand-400 disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-zinc-500">
          sch00l teaches — it doesn&apos;t cheat. Shift+Enter for new line.
        </p>
      </div>
    </div>
  );
}
