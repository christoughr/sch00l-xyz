"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Download, Trash2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { clearLocalUserData } from "@/lib/compliance";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const showCloudActions = !!user;

  async function exportData() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) throw new Error("Export failed");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sch00l-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus("Download started.");
    } catch {
      setStatus("Export failed.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteAccount() {
    if (
      !confirm(
        "Delete your account and all cloud data? This cannot be undone."
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      clearLocalUserData();
      await signOut();
      router.push("/");
      setStatus("Account deleted.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  function clearLocal() {
    clearLocalUserData();
    setStatus("Local browser data cleared. Refresh to see age gate again.");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      <p className="mt-2 text-sm text-zinc-400">
        {user
          ? "Export your data or delete your account (GDPR / FERPA-friendly)."
          : "Clear local browser data without signing in."}
      </p>

      <div className="mt-8 space-y-4">
        {showCloudActions && (
          <button
            type="button"
            onClick={exportData}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white hover:bg-white/10 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export my data (JSON)
          </button>
        )}

        <button
          type="button"
          onClick={clearLocal}
          className="w-full rounded-xl border border-white/10 py-3 text-sm text-zinc-300 hover:bg-white/5"
        >
          Clear local browser data
        </button>

        {showCloudActions && (
          <button
            type="button"
            onClick={deleteAccount}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete account
          </button>
        )}
      </div>

      {status && <p className="mt-4 text-sm text-brand-300">{status}</p>}
    </div>
  );
}
