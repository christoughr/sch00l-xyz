"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, BookOpen, Upload, FileText } from "lucide-react";
import { STUDY_TRACKS } from "@/lib/study-tracks";
import { getTrackSections, getSectionLabel } from "@/lib/track-sections";
import Link from "next/link";

type Assignment = {
  id: string;
  title: string;
  studyTrackId: string | null;
  sectionId: string | null;
  topic: string | null;
  assignToAll: boolean;
  studentIds: string[];
};

type Material = {
  id: string;
  file_name: string;
  mime_type: string | null;
  byte_size: number | null;
  created_at: string;
};

type RosterStudent = { id: string; email: string };

type GradeRow = {
  assignment_id: string;
  user_id: string;
  score: number | null;
  notes: string | null;
};

export function ClassroomAssignments({
  classroomId,
  students,
}: {
  classroomId: string;
  students: RosterStudent[];
}) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrationHint, setMigrationHint] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [trackId, setTrackId] = useState(
    () => STUDY_TRACKS.find((t) => t.id.includes("bio"))?.id ?? STUDY_TRACKS[0]?.id ?? ""
  );
  const [sectionId, setSectionId] = useState("");
  const [assignAll, setAssignAll] = useState(true);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const sections = getTrackSections(trackId);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, mRes, gRes] = await Promise.all([
        fetch(`/api/classrooms/${classroomId}/assignments`),
        fetch(`/api/classrooms/${classroomId}/materials`),
        fetch(`/api/classrooms/${classroomId}/grades`),
      ]);
      const aData = await aRes.json();
      const mData = await mRes.json();
      const gData = await gRes.json();

      if (aData.migrationRequired || mData.migrationRequired) {
        setMigrationHint(aData.migrationRequired ?? mData.migrationRequired);
        setAssignments([]);
        setMaterials([]);
      } else {
        setMigrationHint(null);
        setAssignments(aData.assignments ?? []);
        setMaterials(mData.materials ?? []);
      }
      setGrades(gData.grades ?? []);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const s = getTrackSections(trackId);
    setSectionId(s[0]?.id ?? "");
  }, [trackId]);

  async function createAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          studyTrackId: trackId,
          sectionId: sectionId || undefined,
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

  async function uploadFiles(files: FileList | File[]) {
    if (migrationHint) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(`/api/classrooms/${classroomId}/materials`, {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function autoAssignFromMaterial(materialId: string, fileName: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/classrooms/${classroomId}/materials/${materialId}/auto-assign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignToAll: assignAll, studentIds: assignAll ? undefined : [...picked] }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Auto-assign failed");
      setTitle(data.suggestion?.title ?? fileName);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto-assign failed");
    } finally {
      setSaving(false);
    }
  }

  async function importRoster(file: File, source: "google_classroom" | "canvas_csv") {
    setImporting(true);
    setImportResult(null);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("source", source);
      fd.append("file", file);
      const res = await fetch(`/api/classrooms/${classroomId}/import`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setImportResult(
        `Imported ${data.emailCount} emails. Copy invite:\n${data.inviteMessage}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  async function saveGrade(assignmentId: string, userId: string, score: string, notes: string) {
    const res = await fetch(`/api/classrooms/${classroomId}/grades`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId,
        userId,
        score: score === "" ? null : Number(score),
        notes: notes || null,
      }),
    });
    if (res.ok) await load();
  }

  function toggleStudent(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const firstAssignment = assignments[0];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-brand-400" />
          <h2 className="text-lg font-semibold text-white">Course materials</h2>
        </div>
        <p className="text-sm text-zinc-400">
          Drag and drop PDF, Word, or text files. AI uses them for tutoring and can
          auto-assign a matching unit.
        </p>

        {migrationHint && (
          <p className="text-sm text-amber-200/90 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            Run SQL in Supabase first: <strong>008</strong> then <strong>009</strong> (see chat).
          </p>
        )}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) void uploadFiles(e.dataTransfer.files);
          }}
          className={`rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragOver ? "border-brand-400 bg-brand-500/10" : "border-white/15 bg-black/20"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.txt,.md,.doc,.docx"
            className="hidden"
            onChange={(e) => e.target.files && void uploadFiles(e.target.files)}
          />
          <p className="text-sm text-zinc-400">
            {uploading ? "Uploading…" : "Drop files here or"}
          </p>
          <button
            type="button"
            disabled={uploading || !!migrationHint}
            onClick={() => fileRef.current?.click()}
            className="mt-2 text-sm text-brand-400 hover:underline disabled:opacity-50"
          >
            browse to upload
          </button>
        </div>

        {materials.length > 0 && (
          <ul className="space-y-2 text-sm">
            {materials.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-4 py-3"
              >
                <span className="text-zinc-300 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-zinc-500" />
                  {m.file_name}
                </span>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void autoAssignFromMaterial(m.id, m.file_name)}
                  className="text-xs rounded-lg bg-white/10 px-3 py-1.5 text-brand-300 hover:bg-white/15"
                >
                  Auto-assign unit
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Import roster</h2>
        <p className="text-sm text-zinc-400">
          Google Classroom or Canvas CSV export (must include an Email column).
        </p>
        <input
          ref={importRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importRoster(f, "google_classroom");
          }}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={importing}
            onClick={() => importRef.current?.click()}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
          >
            {importing ? "Importing…" : "Upload Classroom CSV"}
          </button>
        </div>
        {importResult && (
          <pre className="text-xs text-zinc-400 whitespace-pre-wrap rounded-lg bg-black/30 p-3">
            {importResult}
          </pre>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-400" />
          <h2 className="text-lg font-semibold text-white">Assignments</h2>
        </div>
        <p className="text-sm text-zinc-400">
          Pick a track and <strong className="text-zinc-300">unit section</strong> for
          the whole class or selected students.
        </p>

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
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
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
                    {track?.label ?? a.studyTrackId} ·{" "}
                    {getSectionLabel(a.studyTrackId ?? "", a.sectionId)} ·{" "}
                    {a.assignToAll ? "Whole class" : `${a.studentIds.length} student(s)`}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No assignments yet.</p>
        )}
      </section>

      {firstAssignment && students.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Gradebook</h2>
          <p className="text-sm text-zinc-500">
            Override scores for <span className="text-zinc-400">{firstAssignment.title}</span>
          </p>
          <ul className="space-y-3">
            {students.map((s) => {
              const g = grades.find(
                (x) =>
                  x.assignment_id === firstAssignment.id && x.user_id === s.id
              );
              return (
                <GradebookRow
                  key={s.id}
                  email={s.email}
                  initialScore={g?.score != null ? String(g.score) : ""}
                  initialNotes={g?.notes ?? ""}
                  onSave={(score, notes) =>
                    void saveGrade(firstAssignment.id, s.id, score, notes)
                  }
                />
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function GradebookRow({
  email,
  initialScore,
  initialNotes,
  onSave,
}: {
  email: string;
  initialScore: string;
  initialNotes: string;
  onSave: (score: string, notes: string) => void;
}) {
  const [score, setScore] = useState(initialScore);
  const [notes, setNotes] = useState(initialNotes);

  return (
    <li className="flex flex-wrap gap-2 items-center text-sm border border-white/10 rounded-lg px-3 py-2">
      <span className="text-zinc-400 flex-1 min-w-[140px]">{email}</span>
      <input
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Score %"
        className="w-20 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-white"
      />
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes"
        className="flex-1 min-w-[120px] rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-white"
      />
      <button
        type="button"
        onClick={() => onSave(score, notes)}
        className="text-xs text-brand-400 hover:underline"
      >
        Save
      </button>
    </li>
  );
}
