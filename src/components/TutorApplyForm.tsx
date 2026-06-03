"use client";

import { useState } from "react";
import { Loader2, GraduationCap } from "lucide-react";
import { saveTutorApplicationLocal } from "@/lib/tutor-handoff";
import { SUBJECTS } from "@/lib/subjects";

export function TutorApplyForm() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [subjects, setSubjects] = useState<string[]>(["math"]);
  const [bio, setBio] = useState("");
  const [credentials, setCredentials] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  function toggleSubject(id: string) {
    setSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !displayName.trim() || subjects.length === 0) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/tutors/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          displayName,
          subjects,
          bio: bio || undefined,
          credentials: credentials || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.mode === "local") {
        saveTutorApplicationLocal({
          email: email.trim(),
          displayName: displayName.trim(),
          subjects,
          bio: bio || undefined,
          credentials: credentials || undefined,
        });
      }

      setStatus("ok");
      setMessage(data.message);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "ok") {
    return <p className="text-sm text-brand-300">{message}</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        type="text"
        required
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your name"
        className="w-full rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="w-full rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
      />
      <div>
        <p className="text-sm text-zinc-400 mb-2">Subjects you tutor</p>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={subjects.includes(s.id)}
              onClick={() => toggleSubject(s.id)}
              className={`rounded-lg px-3 py-1 text-xs border ${
                subjects.includes(s.id)
                  ? "border-brand-400 bg-brand-500/20 text-brand-200"
                  : "border-white/10 text-zinc-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={credentials}
        onChange={(e) => setCredentials(e.target.value)}
        placeholder="Credentials (AP certified, 5 yrs tutoring, etc.)"
        rows={2}
        className="w-full rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none resize-none"
      />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Short bio — your teaching style"
        rows={3}
        className="w-full rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none resize-none"
      />
      <button
        type="submit"
        disabled={status === "loading" || subjects.length === 0}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-400 disabled:opacity-50"
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GraduationCap className="h-4 w-4" />
        )}
        Apply to tutor
      </button>
      {message && status === "error" && (
        <p className="text-sm text-red-400">{message}</p>
      )}
    </form>
  );
}
