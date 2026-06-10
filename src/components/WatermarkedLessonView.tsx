"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function WatermarkedLessonView({
  lessonId,
  title,
  onBodyLoaded,
}: {
  lessonId: string;
  title: string;
  onBodyLoaded?: (body: string) => void;
}) {
  const [body, setBody] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tokRes = await fetch(`/api/lessons/${lessonId}/token`, {
        method: "POST",
      });
      if (!tokRes.ok) {
        const d = await tokRes.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? "Could not unlock lesson");
      }
      const { token } = (await tokRes.json()) as { token: string };
      const contentRes = await fetch(
        `/api/lessons/${lessonId}/content?token=${encodeURIComponent(token)}`
      );
      if (!contentRes.ok) {
        throw new Error("Lesson content expired — refresh to continue");
      }
      const data = (await contentRes.json()) as { body_markdown: string };
      setBody(data.body_markdown);
      onBodyLoaded?.(data.body_markdown);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load lesson");
      setBody(null);
    } finally {
      setLoading(false);
    }
  }, [lessonId, onBodyLoaded]);

  useEffect(() => {
    void load();
    const refresh = setInterval(() => void load(), 4 * 60 * 1000);
    return () => clearInterval(refresh);
  }, [load]);

  if (loading && !body) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading protected lesson…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-amber-400">
        {error}{" "}
        <button type="button" className="underline" onClick={() => void load()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="watermarked-lesson relative">
      <div
        className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-[0.07]"
        aria-hidden
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="absolute whitespace-nowrap text-xs font-medium text-white"
            style={{
              top: `${(i % 4) * 28 + 8}%`,
              left: `${(i % 3) * 30 - 5}%`,
              transform: "rotate(-24deg)",
            }}
          >
            sch00l.ai · licensed copy
          </span>
        ))}
      </div>
      <p className="text-xs font-medium text-brand-300 mb-2">{title}</p>
      <div className="max-h-56 overflow-y-auto text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed select-none">
        {body?.slice(0, 6000)}
        {(body?.length ?? 0) > 6000 ? "\n\n…" : ""}
      </div>
    </div>
  );
}
