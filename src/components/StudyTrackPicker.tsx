"use client";

import { useMemo, useState } from "react";
import type { StudyTrack, StudyTrackCategory, StudyTrackId } from "@/lib/study-tracks";
import { TRACK_CATEGORIES, tracksInCategory } from "@/lib/study-tracks";

export function StudyTrackPicker({
  value,
  onChange,
}: {
  value: StudyTrackId;
  onChange: (track: StudyTrack) => void;
}) {
  const [category, setCategory] = useState<StudyTrackCategory | "all">("all");

  const tracks = useMemo(() => tracksInCategory(category), [category]);

  return (
    <div className="space-y-3">
      <div className="relative -mx-1 px-1">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {TRACK_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="button"
              data-testid={`track-category-${c.id}`}
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
                category === c.id
                  ? "bg-brand-500 text-white"
                  : "border border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-[min(50vh,420px)] overflow-y-auto pr-1">
        {tracks.map((track) => (
          <button
            key={track.id}
            type="button"
            aria-pressed={value === track.id}
            onClick={() => onChange(track)}
            className={`rounded-xl border p-3 text-left transition ${
              value === track.id
                ? "border-brand-400/50 bg-brand-500/10 ring-1 ring-brand-400/30"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <p className="font-medium text-white text-sm">{track.label}</p>
            <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">
              {track.description}
            </p>
          </button>
        ))}
      </div>
      <p className="text-xs text-zinc-500">
        {tracks.length} tracks · pick one or use Custom for your own topic
      </p>
    </div>
  );
}
