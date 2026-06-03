"use client";

import { useState } from "react";
import { Loader2, Mail, GraduationCap } from "lucide-react";

export function WaitlistForm({ source = "landing" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [isEdu, setIsEdu] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, is_edu: isEdu }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("ok");
      setMessage(
        data.message ??
          (isEdu
            ? "You're on the educator priority list!"
            : "You're on the list!")
      );
      setEmail("");
      setIsEdu(false);
      if (data.mode === "local" && typeof window !== "undefined") {
        const pending = JSON.parse(
          localStorage.getItem("sch00l_waitlist_pending") ?? "[]"
        ) as string[];
        const normalized = email.toLowerCase().trim();
        if (!pending.includes(normalized)) {
          pending.push(normalized);
          localStorage.setItem(
            "sch00l_waitlist_pending",
            JSON.stringify(pending)
          );
        }
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={submit} className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (/\.edu$/i.test(e.target.value)) setIsEdu(true);
              }}
              placeholder="you@school.edu"
              className="w-full rounded-xl border border-white/10 bg-surface-900 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white hover:bg-brand-400 disabled:opacity-50 whitespace-nowrap"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              "Join waitlist"
            )}
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <input
            type="checkbox"
            checked={isEdu}
            onChange={(e) => setIsEdu(e.target.checked)}
          />
          <GraduationCap className="h-4 w-4" />
          I&apos;m a teacher / .edu email — priority for pilots
        </label>
      </form>
      {message && (
        <p
          className={`mt-3 text-sm ${status === "error" ? "text-red-400" : "text-brand-300"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
