"use client";

import type { StudyTrack, StudyTrackId } from "@/lib/study-tracks";
import { STUDY_TRACKS } from "@/lib/study-tracks";

export function StudyTrackPicker({
  value,
  onChange,
}: {
  value: StudyTrackId;
  onChange: (track: StudyTrack) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {STUDY_TRACKS.map((track) => (
        <button
          key={track.id}
          type="button"
          aria-pressed={value === track.id}
          onClick={() => onChange(track)}
          className={`rounded-xl border p-4 text-left transition ${
            value === track.id
              ? "border-brand-400/50 bg-brand-500/10"
              : "border-white/10 bg-white/5 hover:border-white/20"
          }`}
        >
          <p className="font-medium text-white">{track.label}</p>
          <p className="mt-1 text-xs text-zinc-400">{track.description}</p>
        </button>
      ))}
    </div>
  );
}
