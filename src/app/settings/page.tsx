"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Download, Trash2, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { clearLocalUserData } from "@/lib/compliance";
import { downloadLocalExport, loadWaitlistLocal } from "@/lib/local-export";
import { loadTutorRequestsLocal } from "@/lib/tutor-handoff";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [statusKind, setStatusKind] = useState<"ok" | "error">("ok");

  function setStatusMsg(msg: string, kind: "ok" | "error" = "ok") {
    setStatus(msg);
    setStatusKind(kind);
  }
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const showCloudActions = !!user;

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

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
      setStatusMsg("Download started.");
    } catch {
      setStatusMsg("Export failed.", "error");
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
      setStatusMsg("Account deleted.");
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : "Delete failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  function clearLocal() {
    clearLocalUserData();
    setStatusMsg(
      "Local browser data cleared. Refresh the page — age gate may appear again if consent was removed."
    );
  }

  const waitlistLocal = loadWaitlistLocal().length;
  const tutorLocal = loadTutorRequestsLocal().length;

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      <p className="mt-2 text-sm text-zinc-400">
        {user
          ? "Export your data or delete your account (GDPR / FERPA-friendly)."
          : "Export or clear local browser data — includes waitlist, tutor requests, progress, and consent."}
      </p>

      {(waitlistLocal > 0 || tutorLocal > 0) && (
        <p className="mt-3 text-xs text-zinc-500">
          On this device: {waitlistLocal} waitlist email
          {waitlistLocal === 1 ? "" : "s"}, {tutorLocal} tutor request
          {tutorLocal === 1 ? "" : "s"}.
        </p>
      )}

      {user && (
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut || busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white hover:bg-white/10 disabled:opacity-50"
        >
          {signingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      )}

      <div className="mt-8 space-y-4">
        <button
          type="button"
          onClick={() => {
            downloadLocalExport();
            setStatusMsg("Local export downloaded.");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-400/30 bg-brand-500/10 py-3 text-sm text-brand-200 hover:bg-brand-500/20"
        >
          <Download className="h-4 w-4" />
          Export local data (JSON)
        </button>

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

      {status && (
        <p
          className={`mt-4 text-sm ${statusKind === "error" ? "text-red-400" : "text-brand-300"}`}
          role="status"
        >
          {status}
        </p>
      )}
    </div>
  );
}
