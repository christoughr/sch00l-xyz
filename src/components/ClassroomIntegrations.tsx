"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Link2, Upload, RefreshCw } from "lucide-react";
import { PLATFORMS, type PlatformId } from "@/lib/integrations";
import { TeacherLmsOAuth } from "./TeacherLmsOAuth";

type Connection = {
  id: string;
  platform: PlatformId;
  externalCourseId: string | null;
  syncEnabled: boolean;
  lastSyncAt: string | null;
  createdAt: string;
};

export function ClassroomIntegrations({
  classroomId,
}: {
  classroomId: string;
}) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<PlatformId>("google_classroom");
  const [courseId, setCourseId] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [csvText, setCsvText] = useState("");
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPlatform = PLATFORMS.find((p) => p.id === platform);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/integrations`);
      const data = await res.json();
      if (res.ok) setConnections(data.connections ?? []);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    load();
  }, [load]);

  async function connect(e: React.FormEvent) {
    e.preventDefault();
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/integrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "connect",
          platform,
          externalCourseId: courseId.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not connect");
      setCourseId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect");
    } finally {
      setConnecting(false);
    }
  }

  async function syncConnection(connectionId: string, csv?: string) {
    setSyncing(connectionId);
    setSyncResult(null);
    setError(null);
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/integrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync",
          connectionId,
          csvText: csv,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      setSyncResult(
        `Synced ${data.emailCount} emails${data.invalidRows ? ` (${data.invalidRows} invalid rows skipped)` : ""}.`
      );
      setCsvText("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(null);
    }
  }

  function handleCsvFile(file: File, connectionId: string) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      syncConnection(connectionId, text);
    };
    reader.readAsText(file);
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Link2 className="h-5 w-5 text-brand-400" />
        <h2 className="text-lg font-semibold text-white">Integrations</h2>
      </div>

      <TeacherLmsOAuth />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm"
          >
            <p className="font-medium text-white">{p.label}</p>
            <p className="mt-1 text-xs text-zinc-500">{p.description}</p>
            <p className="mt-2 text-xs text-zinc-600">
              {p.csv && "CSV · "}
              {p.api && "API"}
              {!p.csv && !p.api && "Link only"}
            </p>
          </div>
        ))}
      </div>

      <form
        onSubmit={connect}
        className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
      >
        <h3 className="text-sm font-medium text-white">Connect platform</h3>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as PlatformId)}
          className="w-full rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
        >
          {PLATFORMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        {selectedPlatform?.api && (
          <input
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="External course ID (optional)"
            className="w-full rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
          />
        )}
        <button
          type="submit"
          disabled={connecting}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400 disabled:opacity-50"
        >
          {connecting ? "Connecting…" : "Connect"}
        </button>
      </form>

      {selectedPlatform?.csv && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Upload className="h-4 w-4 text-brand-400" />
            CSV roster sync
          </h3>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste CSV with email column, or upload below after connecting…"
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-xs font-mono text-white focus:border-brand-400 focus:outline-none resize-y"
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
        </div>
      ) : connections.length === 0 ? (
        <p className="text-sm text-zinc-500">No connections yet.</p>
      ) : (
        <ul className="space-y-3">
          {connections.map((c) => {
            const label =
              PLATFORMS.find((p) => p.id === c.platform)?.label ?? c.platform;
            return (
              <li
                key={c.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">{label}</p>
                    {c.externalCourseId && (
                      <p className="text-xs text-zinc-500">
                        Course: {c.externalCourseId}
                      </p>
                    )}
                    <p className="text-xs text-zinc-500 mt-1">
                      Last sync:{" "}
                      {c.lastSyncAt
                        ? new Date(c.lastSyncAt).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        syncConnection(c.id, csvText.trim() || undefined)
                      }
                      disabled={syncing === c.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`h-3 w-3 ${syncing === c.id ? "animate-spin" : ""}`}
                      />
                      Sync
                    </button>
                    <label className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 cursor-pointer">
                      <Upload className="h-3 w-3" />
                      Upload CSV
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleCsvFile(f, c.id);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {syncResult && (
        <p className="text-sm text-brand-300">{syncResult}</p>
      )}
      {error && (
        <p className="text-sm text-amber-300" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
