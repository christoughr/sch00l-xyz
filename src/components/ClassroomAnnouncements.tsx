"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Megaphone, Pin } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
};

export function ClassroomAnnouncements({
  classroomId,
  canPost = true,
}: {
  classroomId: string;
  canPost?: boolean;
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/announcements`);
      const data = await res.json();
      if (res.ok) {
        setAnnouncements(data.announcements ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), pinned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not post");
      setTitle("");
      setBody("");
      setPinned(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post");
    } finally {
      setPosting(false);
    }
  }

  const pinnedList = announcements.filter((a) => a.pinned);
  const regularList = announcements.filter((a) => !a.pinned);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-brand-400" />
        <h2 className="text-lg font-semibold text-white">Announcements</h2>
      </div>

      {canPost && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message to class…"
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none resize-y"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="rounded border-white/20"
              />
              Pin to top
            </label>
            <button
              type="submit"
              disabled={posting || !title.trim() || !body.trim()}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400 disabled:opacity-50"
            >
              {posting ? "Posting…" : "Post announcement"}
            </button>
          </div>
          {error && (
            <p className="text-sm text-amber-300" role="alert">
              {error}
            </p>
          )}
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
        </div>
      ) : announcements.length === 0 ? (
        <p className="text-sm text-zinc-500">No announcements yet.</p>
      ) : (
        <div className="space-y-4">
          {pinnedList.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Pinned
              </p>
              {pinnedList.map((a) => (
                <AnnouncementCard key={a.id} announcement={a} pinned />
              ))}
            </div>
          )}
          {regularList.length > 0 && (
            <div className="space-y-2">
              {pinnedList.length > 0 && (
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Recent
                </p>
              )}
              {regularList.map((a) => (
                <AnnouncementCard key={a.id} announcement={a} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function AnnouncementCard({
  announcement,
  pinned,
}: {
  announcement: Announcement;
  pinned?: boolean;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-white">{announcement.title}</h3>
        {pinned && (
          <Pin className="h-4 w-4 shrink-0 text-brand-400" aria-label="Pinned" />
        )}
      </div>
      <p className="mt-2 text-sm text-zinc-300 whitespace-pre-wrap">
        {announcement.body}
      </p>
      <p className="mt-2 text-xs text-zinc-500">
        {new Date(announcement.createdAt).toLocaleString()}
      </p>
    </article>
  );
}
