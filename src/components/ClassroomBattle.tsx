"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Loader2, Swords, ExternalLink } from "lucide-react";
import { StudyTrackPicker } from "./StudyTrackPicker";
import { STUDY_TRACKS, type StudyTrack, type StudyTrackId } from "@/lib/study-tracks";

type Battle = {
  id: string;
  roomCode: string;
  studyTrackId: string;
  status: string;
  homeworkMode: boolean;
  dueAt: string | null;
  createdAt: string;
};

export function ClassroomBattle({ classroomId }: { classroomId: string }) {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [trackId, setTrackId] = useState<StudyTrackId>(
    () => STUDY_TRACKS[0]?.id ?? "custom"
  );
  const [homeworkMode, setHomeworkMode] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/battles`);
      const data = await res.json();
      if (res.ok) setBattles(data.battles ?? []);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    load();
  }, [load]);

  function handleTrackChange(track: StudyTrack) {
    setTrackId(track.id);
  }

  async function startBattle() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/battles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studyTrackId: trackId,
          homeworkMode,
          questionCount: 8,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create battle");
      setLastCode(data.roomCode);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create battle");
    } finally {
      setCreating(false);
    }
  }

  function copyLink(code: string) {
    const url = `${window.location.origin}/battle/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Swords className="h-5 w-5 text-brand-400" />
        <h2 className="text-lg font-semibold text-white">Live battle</h2>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
        <p className="text-sm text-zinc-400">
          Start a live quiz battle. Share the room link with students.
        </p>
        <StudyTrackPicker value={trackId} onChange={handleTrackChange} />
        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={homeworkMode}
            onChange={(e) => setHomeworkMode(e.target.checked)}
            className="rounded border-white/20"
          />
          Homework mode (async — students can answer until due date)
        </label>
        <button
          type="button"
          onClick={startBattle}
          disabled={creating}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400 disabled:opacity-50"
        >
          {creating ? "Creating…" : "Start new battle"}
        </button>
        {error && (
          <p className="text-sm text-amber-300" role="alert">
            {error}
          </p>
        )}
      </div>

      {lastCode && (
        <div className="rounded-xl border border-brand-400/30 bg-brand-500/10 p-4">
          <p className="text-sm text-brand-200">Battle created!</p>
          <p className="mt-1 font-mono text-lg text-white">{lastCode}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/battle/${lastCode}`}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-sm text-white hover:bg-brand-400"
            >
              Open battle room
              <ExternalLink className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={() => copyLink(lastCode)}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/5"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
        </div>
      ) : battles.length === 0 ? (
        <p className="text-sm text-zinc-500">No battles yet.</p>
      ) : (
        <ul className="space-y-2">
          {battles.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm"
            >
              <div>
                <span className="font-mono text-brand-300">{b.roomCode}</span>
                <span className="ml-2 text-zinc-500 capitalize">{b.status}</span>
                {b.homeworkMode && (
                  <span className="ml-2 text-xs text-amber-300">homework</span>
                )}
              </div>
              <Link
                href={`/battle/${b.roomCode}`}
                className="text-brand-400 hover:underline"
              >
                /battle/{b.roomCode}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
