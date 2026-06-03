"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function OnboardingForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [ferpaOk, setFerpaOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: name.trim(),
          grade_level: grade.trim() || undefined,
          onboarding_complete: true,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Could not save profile");
      }
      if (ferpaOk) {
        await fetch("/api/compliance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ferpaOk: true }),
        });
      }
      router.push("/study");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-md">
      <p className="text-sm text-zinc-400">
        Signed in as {user?.email ?? "guest"}. Tell us a bit about you.
      </p>
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Display name"
        className="w-full rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-white focus:border-brand-400 focus:outline-none"
      />
      <input
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        placeholder="Grade / level (optional)"
        className="w-full rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-white focus:border-brand-400 focus:outline-none"
      />
      <label className="flex items-start gap-2 text-sm text-zinc-400">
        <input
          type="checkbox"
          checked={ferpaOk}
          onChange={(e) => setFerpaOk(e.target.checked)}
          className="mt-1 rounded border-white/20"
        />
        I agree to educational data use under school/FERPA-style privacy (required for classroom features).
      </label>
        <button
          type="submit"
          disabled={loading || !name.trim()}
        className="w-full rounded-xl bg-brand-500 py-3 text-white hover:bg-brand-400 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Start studying"}
      </button>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
