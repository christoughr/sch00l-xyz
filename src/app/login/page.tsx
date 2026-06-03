"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { ComingSoonBanner } from "@/components/ComingSoonBanner";

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return;

    setStatus("loading");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/study`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
      setMessage("Check your email for the magic link.");
    }
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Logo />
        <h1 className="mt-8 text-2xl font-bold text-white">Accounts coming soon</h1>
        <ComingSoonBanner feature="Sign in with email" />
        <p className="text-sm text-zinc-400 leading-relaxed">
          Cloud accounts launch after Supabase setup. You can use everything
          below right now:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-zinc-300 list-disc pl-5">
          <li>AI tutor (Groq)</li>
          <li>Pre/post quizzes & flashcards</li>
          <li>Progress & streaks in your browser</li>
        </ul>
        <Link
          href="/study"
          className="mt-8 inline-block w-full text-center rounded-xl bg-brand-500 py-3 font-medium text-white hover:bg-brand-400"
        >
          Start studying →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8">
        <Logo />
      </div>
      <h1 className="text-2xl font-bold text-white">Sign in</h1>
      <p className="mt-2 text-zinc-400 text-sm">
        Save progress, flashcards, and quiz results across devices.
      </p>

      <form onSubmit={sendMagicLink} className="mt-8 space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@email.com"
            className="w-full rounded-xl border border-white/10 bg-surface-900 py-3 pl-10 pr-4 text-white focus:border-brand-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-xl bg-brand-500 py-3 font-medium text-white hover:bg-brand-400 disabled:opacity-50"
        >
          {status === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            "Email me a magic link"
          )}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm ${status === "error" ? "text-red-400" : "text-brand-300"}`}
        >
          {message}
        </p>
      )}

      <p className="mt-8 text-center text-sm text-zinc-500">
        <Link href="/study" className="text-brand-400 hover:underline">
          Continue without account
        </Link>
      </p>
    </div>
  );
}
