"use client";

import { getTrackSections, type TrackSection } from "@/lib/track-sections";
import type { StudyTrackId } from "@/lib/study-tracks";

export function StudyUnitPicker({
  trackId,
  value,
  onChange,
}: {
  trackId: StudyTrackId;
  value: string | null;
  onChange: (sectionId: string | null, section: TrackSection | null) => void;
}) {
  const sections = getTrackSections(trackId);

  return (
    <div>
      <p className="text-sm font-medium text-zinc-300 mb-3">Unit / section</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null, null)}
          className={`rounded-lg border px-3 py-2 text-xs transition ${
            value === null
              ? "border-brand-400/50 bg-brand-500/15 text-white"
              : "border-white/10 bg-surface-900 text-zinc-400 hover:border-white/20"
          }`}
        >
          Full track overview
        </button>
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id, s)}
            title={s.description}
            className={`rounded-lg border px-3 py-2 text-xs text-left transition max-w-full sm:max-w-xs ${
              value === s.id
                ? "border-brand-400/50 bg-brand-500/15 text-white"
                : "border-white/10 bg-surface-900 text-zinc-400 hover:border-white/20"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {value && (
        <p className="mt-2 text-xs text-zinc-500">
          {sections.find((s) => s.id === value)?.description}
        </p>
      )}
    </div>
  );
}
