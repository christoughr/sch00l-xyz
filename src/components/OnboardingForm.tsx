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
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: name.trim(),
          grade_level: grade.trim() || undefined,
          onboarding_complete: true,
        }),
      });
      router.push("/study");
      router.refresh();
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
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-500 py-3 text-white hover:bg-brand-400 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Start studying"}
      </button>
    </form>
  );
}
