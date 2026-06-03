"use client";

import { SUBJECTS } from "@/lib/subjects";
import type { SubjectId } from "@/lib/types";

export function SubjectPicker({
  value,
  onChange,
}: {
  value: SubjectId;
  onChange: (id: SubjectId) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {SUBJECTS.map((s) => (
        <button
          key={s.id}
          type="button"
          aria-pressed={value === s.id}
          onClick={() => onChange(s.id)}
          className={`rounded-xl border p-3 text-left transition ${
            value === s.id
              ? "border-brand-400 bg-brand-500/15 ring-1 ring-brand-400/50"
              : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
          }`}
        >
          <span className="text-lg">{s.emoji}</span>
          <p className="mt-1 font-medium text-white">{s.label}</p>
          <p className="text-xs text-zinc-400">{s.description}</p>
        </button>
      ))}
    </div>
  );
}
