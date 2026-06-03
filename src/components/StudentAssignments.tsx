"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, BookOpen } from "lucide-react";

type Row = {
  id: string;
  title: string;
  trackLabel?: string;
  sectionLabel?: string;
  studyUrl: string;
  dueAt: string | null;
};

export function StudentAssignments() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/assignments")
      .then((r) => r.json())
      .then((d) => setRows(d.assignments ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (rows.length === 0) return null;

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-brand-400" />
        <h2 className="text-sm font-semibold text-white">Your assignments</h2>
      </div>
      <ul className="space-y-2">
        {rows.map((a) => (
          <li key={a.id} className="text-sm">
            <Link href={a.studyUrl} className="text-brand-300 hover:underline font-medium">
              {a.title}
            </Link>
            <span className="text-zinc-500 block text-xs mt-0.5">
              {a.trackLabel}
              {a.sectionLabel ? ` · ${a.sectionLabel}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
