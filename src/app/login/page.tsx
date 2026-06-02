"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const configured = isSupabaseConfigured();

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      setStatus("error");
      setMessage("Add Supabase keys to .env.local first (see README).");
      return;
    }

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
