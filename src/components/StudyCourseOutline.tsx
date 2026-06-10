"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, ChevronRight, Lock } from "lucide-react";
import { resolveCourseTrackId } from "@/lib/course-tracks";

type Lesson = {
  id: string;
  ord: number;
  title: string;
  body_markdown: string;
  locked?: boolean;
  contentProtected?: boolean;
};

type Unit = {
  id: string;
  ord: number;
  title: string;
  description: string | null;
  lessons: Lesson[];
};

type CourseAccess = {
  full: boolean;
  gated: boolean;
  previewLimit: number;
};

export function StudyCourseOutline({
  trackId,
  sectionId,
  onPickLesson,
}: {
  trackId: string;
  sectionId: string | null;
  onPickLesson: (pick: {
    lessonId: string;
    title: string;
    body: string;
    locked: boolean;
    contentProtected: boolean;
  }) => void;
}) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [access, setAccess] = useState<CourseAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/courses/${resolveCourseTrackId(trackId)}`)
      .then((r) => r.json())
      .then((d) => {
        const list = (d.units ?? []) as Unit[];
        setUnits(list);
        setAccess((d.access as CourseAccess) ?? null);
        if (sectionId) {
          const match = list.find(
            (u) =>
              u.title.toLowerCase().includes(sectionId.replace(/-/g, " ")) ||
              u.title.toLowerCase().includes(sectionId.split("-")[0] ?? "")
          );
          if (match) setExpandedUnit(match.id);
        } else if (list[0]) {
          setExpandedUnit(list[0].id);
        }
      })
      .catch(() => setUnits([]))
      .finally(() => setLoading(false));
  }, [trackId, sectionId]);

  if (loading) {
    return (
      <p className="text-sm text-zinc-500">Loading course lessons…</p>
    );
  }

  if (units.length === 0) {
    return null;
  }

  const lessonCount = units.reduce((n, u) => n + u.lessons.length, 0);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-brand-300 mb-3">
        <BookOpen className="h-5 w-5" />
        <h3 className="font-semibold text-white">
          Course lessons ({lessonCount})
        </h3>
      </div>
      {access?.gated && !access.full && (
        <p className="text-xs text-zinc-500 mb-3">
          First {access.previewLimit} lessons free ·{" "}
          <Link href="/pricing" className="text-brand-400 underline">
            Unlock full course
          </Link>
        </p>
      )}
      <ul className="space-y-2">
        {units.map((unit) => (
          <li key={unit.id} className="rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() =>
                setExpandedUnit(expandedUnit === unit.id ? null : unit.id)
              }
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-zinc-200 hover:bg-white/5"
            >
              <span>
                {unit.ord}. {unit.title}
              </span>
              <ChevronRight
                className={`h-4 w-4 transition ${
                  expandedUnit === unit.id ? "rotate-90" : ""
                }`}
              />
            </button>
            {expandedUnit === unit.id && unit.lessons.length > 0 && (
              <ul className="border-t border-white/5 pb-2 max-h-64 overflow-y-auto">
                {[...unit.lessons]
                  .sort((a, b) => a.ord - b.ord)
                  .map((lesson, idx) => (
                  <li key={lesson.id}>
                    {lesson.locked ? (
                      <div className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-500">
                        <Lock className="h-3 w-3 shrink-0" />
                        {idx + 1}. {lesson.title}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onPickLesson({
                            lessonId: lesson.id,
                            title: `${unit.title}: ${lesson.title}`,
                            body: lesson.body_markdown,
                            locked: false,
                            contentProtected: lesson.contentProtected ?? false,
                          })
                        }
                        className="w-full px-4 py-2 text-left text-xs text-zinc-400 hover:text-brand-300 hover:bg-white/5"
                      >
                        {idx + 1}. {lesson.title}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
