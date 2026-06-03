"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, BookOpen } from "lucide-react";
import { STUDY_TRACKS } from "@/lib/study-tracks";
import Link from "next/link";

type Assignment = {
  id: string;
  title: string;
  studyTrackId: string | null;
  topic: string | null;
  dueAt: string | null;
  assignToAll: boolean;
  studentIds: string[];
};

type RosterStudent = { id: string; email: string };

export function ClassroomAssignments({
  classroomId,
  students,
}: {
  classroomId: string;
  students: RosterStudent[];
}) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrationHint, setMigrationHint] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [trackId, setTrackId] = useState(
    () => STUDY_TRACKS.find((t) => t.id.includes("bio"))?.id ?? STUDY_TRACKS[0]?.id ?? ""
  );
  const [assignAll, setAssignAll] = useState(true);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/assignments`);
      const data = await res.json();
      if (data.migrationRequired) {
        setMigrationHint(data.migrationRequired);
        setAssignments([]);
      } else {
        setMigrationHint(null);
        setAssignments(data.assignments ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const track = STUDY_TRACKS.find((t) => t.id === trackId);
      const res = await fetch(`/api/classrooms/${classroomId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          studyTrackId: trackId,
          topic: track?.topic,
          assignToAll: assignAll,
          studentIds: assignAll ? undefined : [...picked],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not assign");
      setTitle("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  function toggleStudent(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-brand-400" />
        <h2 className="text-lg font-semibold text-white">Assignments</h2>
      </div>
      <p className="text-sm text-zinc-400">
        Assign a study track to the whole class or selected students. Students
        study on{" "}
        <Link href="/study" className="text-brand-400 hover:underline">
          Study
        </Link>{" "}
        — you track minutes and lift on this dashboard.
      </p>

      {migrationHint && (
        <p className="text-sm text-amber-200/90 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          Run SQL migration <code className="text-brand-200">{migrationHint}</code>{" "}
          in Supabase to enable assignments and uploads.
        </p>
      )}

      <form onSubmit={createAssignment} className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Assignment title (e.g. Unit 3 — Cell division)"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500"
        />
        <select
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white"
        >
          {STUDY_TRACKS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={assignAll}
            onChange={(e) => setAssignAll(e.target.checked)}
            className="rounded border-white/20"
          />
          Entire class
        </label>
        {!assignAll && students.length > 0 && (
          <ul className="max-h-32 overflow-y-auto space-y-1 rounded-lg border border-white/10 p-2">
            {students.map((s) => (
              <li key={s.id}>
                <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={picked.has(s.id)}
                    onChange={() => toggleStudent(s.id)}
                  />
                  {s.email}
                </label>
              </li>
            ))}
          </ul>
        )}
        {!assignAll && students.length === 0 && (
          <p className="text-xs text-zinc-500">
            No students on roster yet — use entire class or invite students first.
          </p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={saving || !!migrationHint}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 disabled:opacity-50"
        >
          {saving ? "Assigning…" : "Assign to class"}
        </button>
      </form>

      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      ) : assignments.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {assignments.map((a) => {
            const track = STUDY_TRACKS.find((t) => t.id === a.studyTrackId);
            return (
              <li
                key={a.id}
                className="rounded-lg border border-white/10 px-4 py-3 text-zinc-300"
              >
                <span className="text-white font-medium">{a.title}</span>
                <span className="text-zinc-500 block mt-0.5">
                  {track?.label ?? a.studyTrackId ?? "Custom"} ·{" "}
                  {a.assignToAll
                    ? "Whole class"
                    : `${a.studentIds.length} student(s)`}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">No assignments yet.</p>
      )}

      <p className="text-xs text-zinc-600">
        Drag-and-drop homework uploads — shipping next.
      </p>
    </section>
  );
}
