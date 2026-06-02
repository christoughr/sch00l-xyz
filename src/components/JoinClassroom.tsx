"use client";

import { useState } from "react";
import { Loader2, Users } from "lucide-react";
import { useAuth } from "./AuthProvider";
import Link from "next/link";

export function JoinClassroom() {
  const { user, supabaseReady } = useAuth();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function join(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/classrooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("ok");
      setMessage(`Joined "${data.classroom.name}"!`);
      setCode("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to join");
    }
  }

  if (!supabaseReady) {
    return (
      <p className="text-sm text-zinc-500">
        Configure Supabase to join classrooms (see README).
      </p>
    );
  }

  if (!user) {
    return (
      <p className="text-sm text-zinc-400">
        <Link href="/login" className="text-brand-400 hover:underline">
          Sign in
        </Link>{" "}
        to join your teacher&apos;s class.
      </p>
    );
  }

  return (
    <form onSubmit={join} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Class code e.g. ABC123"
            maxLength={8}
            className="w-full rounded-xl border border-white/10 bg-surface-900 py-3 pl-10 pr-4 text-white uppercase tracking-widest focus:border-brand-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-brand-500 px-5 text-white hover:bg-brand-400 disabled:opacity-50"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Join"
          )}
        </button>
      </div>
      {message && (
        <p
          className={`text-sm ${status === "error" ? "text-red-400" : "text-brand-300"}`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
