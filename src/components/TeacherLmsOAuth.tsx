"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function TeacherLmsOAuth() {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [canvasDomain, setCanvasDomain] = useState("");
  const [canvasRequest, setCanvasRequest] = useState("");

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/integrations/google/status");
      const data = await res.json();
      setConnected(!!data.connected);
      setLastSyncAt(data.lastSyncAt ?? null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "google") {
      setToast("Google Classroom connected!");
      load();
    }
    if (params.get("connected") === "canvas") {
      setToast("Canvas connected!");
      load();
    }
  }, [load]);

  async function syncNow() {
    if (!user) return;
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/integrations/google/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      setSyncMsg(
        `Imported ${data.coursesImported} courses, ${data.studentsImported} students`
      );
      await load();
    } catch (e) {
      setSyncMsg(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function disconnect() {
    await fetch("/api/integrations/google/disconnect", { method: "POST" });
    setConnected(false);
    setLastSyncAt(null);
    setSyncMsg(null);
  }

  function connectGoogle() {
    if (!user) return;
    window.location.href = `/api/integrations/google/authorize?teacherId=${user.id}`;
  }

  function connectCanvas() {
    if (!user || !canvasDomain.trim()) return;
    window.location.href = `/api/integrations/canvas/authorize?teacherId=${user.id}&domain=${encodeURIComponent(canvasDomain.trim())}`;
  }

  if (!user) {
    return (
      <p className="text-sm text-zinc-500">
        Sign in as a teacher to connect Google Classroom or Canvas.
      </p>
    );
  }

  return (
    <div className="space-y-4" data-testid="teacher-lms-oauth">
      {toast && (
        <p className="text-sm text-brand-300 rounded-lg border border-brand-400/30 bg-brand-500/10 px-3 py-2">
          {toast}
        </p>
      )}

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-medium text-white">Google Classroom</h3>
          {connected && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
              <Check className="h-3 w-3" />
              Connected
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          OAuth sync for courses and rosters (requires operator env vars).
        </p>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-brand-400 mt-3" />
        ) : connected ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={syncNow}
              disabled={syncing}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400 disabled:opacity-50"
            >
              {syncing ? "Syncing…" : "Sync now"}
            </button>
            <button
              type="button"
              onClick={disconnect}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
            >
              Disconnect
            </button>
            {lastSyncAt && (
              <p className="w-full text-xs text-zinc-500">
                Last synced: {new Date(lastSyncAt).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={connectGoogle}
            className="mt-3 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400"
          >
            Connect Google Classroom
          </button>
        )}
        {syncMsg && <p className="mt-2 text-xs text-brand-300">{syncMsg}</p>}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="font-medium text-white">Canvas LMS</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Per-school Canvas domain. Requires an approved Canvas developer key.
        </p>
        <input
          value={canvasDomain}
          onChange={(e) => setCanvasDomain(e.target.value)}
          placeholder="myschool.instructure.com"
          className="mt-3 w-full rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={connectCanvas}
            disabled={!canvasDomain.trim()}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-50"
          >
            Connect Canvas
          </button>
        </div>
        <form
          className="mt-4 pt-4 border-t border-white/10 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            const body = encodeURIComponent(
              `Canvas integration request from ${user.email}\nSchool domain: ${canvasDomain || "(not provided)"}\nNote: ${canvasRequest}`
            );
            window.location.href = `mailto:hello@sch00l.ai?subject=Canvas%20integration%20request&body=${body}`;
          }}
        >
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <Mail className="h-3 w-3" />
            No developer key yet?
          </p>
          <textarea
            value={canvasRequest}
            onChange={(e) => setCanvasRequest(e.target.value)}
            placeholder="School name, district, approximate student count…"
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-xs text-white focus:border-brand-400 focus:outline-none resize-y"
          />
          <button
            type="submit"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
          >
            Request Canvas integration
          </button>
        </form>
      </div>
    </div>
  );
}
