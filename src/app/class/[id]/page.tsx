"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Loader2, MessageSquare } from "lucide-react";
import { ClassroomAnnouncements } from "@/components/ClassroomAnnouncements";
import { ClassroomForum } from "@/components/ClassroomForum";

type Assignment = {
  id: string;
  classroomId: string;
  title: string;
  trackLabel?: string;
  sectionLabel?: string;
  studyUrl: string;
  dueAt: string | null;
};

export default function StudentClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [classroomId, setClassroomId] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tab, setTab] = useState<"home" | "forum">("home");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setClassroomId(p.id));
  }, [params]);

  useEffect(() => {
    if (!classroomId) return;
    fetch("/api/student/assignments")
      .then((r) => r.json())
      .then((d) => {
        const rows = (d.assignments ?? []).filter(
          (a: Assignment) => a.classroomId === classroomId
        );
        setAssignments(rows);
      })
      .finally(() => setLoading(false));
  }, [classroomId]);

  if (!classroomId) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/join"
        className="text-sm text-zinc-500 hover:text-zinc-300 mb-6 inline-block"
      >
        ← My classes
      </Link>

      <h1 className="text-2xl font-bold text-white mb-6">Class home</h1>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3 mb-6">
        <button
          type="button"
          onClick={() => setTab("home")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            tab === "home"
              ? "bg-brand-500 text-white"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Home
        </button>
        <button
          type="button"
          onClick={() => setTab("forum")}
          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            tab === "forum"
              ? "bg-brand-500 text-white"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Forum
        </button>
      </div>

      {tab === "home" && (
        <div className="space-y-8">
          <ClassroomAnnouncements classroomId={classroomId} canPost={false} />

          <section>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-brand-400" />
              <h2 className="text-lg font-semibold text-white">Assignments</h2>
            </div>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
            ) : assignments.length === 0 ? (
              <p className="text-sm text-zinc-500">No assignments yet.</p>
            ) : (
              <ul className="space-y-2">
                {assignments.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <Link
                      href={a.studyUrl}
                      className="font-medium text-brand-300 hover:underline"
                    >
                      {a.title}
                    </Link>
                    <p className="text-xs text-zinc-500 mt-1">
                      {a.trackLabel}
                      {a.sectionLabel ? ` · ${a.sectionLabel}` : ""}
                      {a.dueAt &&
                        ` · Due ${new Date(a.dueAt).toLocaleDateString()}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {tab === "forum" && (
        <ClassroomForum classroomId={classroomId} isTeacher={false} />
      )}
    </div>
  );
}
