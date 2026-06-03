"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  MessageSquare,
  Pin,
  Lock,
  Flag,
  Trash2,
} from "lucide-react";

type Thread = {
  id: string;
  title: string;
  unitSection: string | null;
  pinned: boolean;
  locked: boolean;
  flagged: boolean;
  createdAt: string;
};

type Post = {
  id: string;
  body: string;
  authorId: string;
  flagged: boolean;
  createdAt: string;
};

export function ClassroomForum({
  classroomId,
  isTeacher = true,
}: {
  classroomId: string;
  isTeacher?: boolean;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [threadLocked, setThreadLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [reply, setReply] = useState("");
  const [creating, setCreating] = useState(false);
  const [replying, setReplying] = useState(false);
  const [modding, setModding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/threads`);
      const data = await res.json();
      if (res.ok) setThreads(data.threads ?? []);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const loadPosts = useCallback(async (threadId: string) => {
    setPostsLoading(true);
    try {
      const res = await fetch(`/api/threads/${threadId}/posts`);
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts ?? []);
        setThreadLocked(!!data.thread?.locked);
      }
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) loadPosts(selectedId);
    else {
      setPosts([]);
      setThreadLocked(false);
    }
  }, [selectedId, loadPosts]);

  async function createThread(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          unitSection: newUnit.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create thread");
      setNewTitle("");
      setNewUnit("");
      await loadThreads();
      setSelectedId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create thread");
    } finally {
      setCreating(false);
    }
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !reply.trim()) return;
    setReplying(true);
    setError(null);
    try {
      const res = await fetch(`/api/threads/${selectedId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not post");
      setReply("");
      await loadPosts(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post");
    } finally {
      setReplying(false);
    }
  }

  async function moderate(action: string) {
    if (!selectedId) return;
    setModding(true);
    try {
      const res = await fetch(`/api/threads/${selectedId}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Moderation failed");
      if (data.deleted) {
        setSelectedId(null);
        await loadThreads();
      } else {
        await loadThreads();
        await loadPosts(selectedId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Moderation failed");
    } finally {
      setModding(false);
    }
  }

  const selected = threads.find((t) => t.id === selectedId);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-brand-400" />
        <h2 className="text-lg font-semibold text-white">Class forum</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="space-y-3">
          <form
            onSubmit={createThread}
            className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2"
          >
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New thread title"
              className="w-full rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
            />
            <input
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              placeholder="Unit / section (optional)"
              className="w-full rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={creating || !newTitle.trim()}
              className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm text-white hover:bg-brand-400 disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create thread"}
            </button>
          </form>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
            </div>
          ) : threads.length === 0 ? (
            <p className="text-sm text-zinc-500">No threads yet.</p>
          ) : (
            <ul className="space-y-1 max-h-[420px] overflow-y-auto">
              {threads.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition ${
                      selectedId === t.id
                        ? "border-brand-400/50 bg-brand-500/10 text-white"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {t.pinned && <Pin className="h-3 w-3 text-brand-400" />}
                      {t.locked && <Lock className="h-3 w-3 text-zinc-500" />}
                      {t.flagged && <Flag className="h-3 w-3 text-amber-400" />}
                      {t.title}
                    </span>
                    {t.unitSection && (
                      <span className="block text-xs text-zinc-500 mt-0.5">
                        {t.unitSection}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 min-h-[280px]">
          {!selectedId ? (
            <p className="text-sm text-zinc-500">Select a thread to view posts.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                <h3 className="font-medium text-white">{selected?.title}</h3>
                {isTeacher && (
                  <div className="flex flex-wrap gap-1">
                    <ModButton
                      label={selected?.pinned ? "Unpin" : "Pin"}
                      onClick={() => moderate(selected?.pinned ? "unpin" : "pin")}
                      disabled={modding}
                    />
                    <ModButton
                      label={selected?.locked ? "Unlock" : "Lock"}
                      onClick={() => moderate(selected?.locked ? "unlock" : "lock")}
                      disabled={modding}
                    />
                    {selected?.flagged && (
                      <ModButton
                        label="Unflag"
                        onClick={() => moderate("unflag")}
                        disabled={modding}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => moderate("delete")}
                      disabled={modding}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
                </div>
              ) : (
                <ul className="space-y-3 max-h-[240px] overflow-y-auto mb-4">
                  {posts.map((p) => (
                    <li
                      key={p.id}
                      className="rounded-lg border border-white/10 bg-surface-900/50 px-3 py-2 text-sm"
                    >
                      <p className="text-zinc-300 whitespace-pre-wrap">{p.body}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {new Date(p.createdAt).toLocaleString()}
                        {p.flagged && (
                          <span className="ml-2 text-amber-400">flagged</span>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {!threadLocked ? (
                <form onSubmit={submitReply} className="space-y-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a reply…"
                    rows={2}
                    className="w-full rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none resize-y"
                  />
                  <button
                    type="submit"
                    disabled={replying || !reply.trim()}
                    className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm text-white hover:bg-brand-400 disabled:opacity-50"
                  >
                    {replying ? "Posting…" : "Reply"}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-zinc-500 flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  Thread is locked.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-amber-300" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

function ModButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded px-2 py-1 text-xs text-zinc-400 border border-white/10 hover:bg-white/5 disabled:opacity-50"
    >
      {label}
    </button>
  );
}
