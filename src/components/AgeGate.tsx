"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  canUseApp,
  isUnder13,
  loadLocalConsent,
  saveLocalConsent,
  type AgeConsent,
} from "@/lib/compliance";

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<AgeConsent | null>(null);
  const [ready, setReady] = useState(false);
  const [birthYear, setBirthYear] = useState("");
  const [parental, setParental] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setConsent(loadLocalConsent());
    setReady(true);
  }, []);

  if (!ready) return null;
  if (consent && canUseApp(consent)) return <>{children}</>;

  const year = parseInt(birthYear, 10);
  const under13 = !Number.isNaN(year) && isUnder13(year);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (Number.isNaN(year) || year < 1990 || year > new Date().getFullYear()) {
      setError("Enter a valid birth year.");
      return;
    }
    if (!terms) {
      setError("Accept the Terms and Privacy Policy to continue.");
      return;
    }
    if (under13 && !parental) {
      setError("Users under 13 need a parent/guardian to confirm consent.");
      return;
    }

    const next: AgeConsent = {
      birthYear: year,
      isUnder13: under13,
      parentalConsent: under13 ? parental : true,
      termsAccepted: true,
      at: new Date().toISOString(),
    };
    saveLocalConsent(next);
    setConsent(next);

    fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birth_year: year,
        is_under_13: under13,
        parental_consent: under13 ? parental : true,
        terms_accepted: true,
      }),
    }).catch(() => {});
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-900/95 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-800 p-8"
      >
        <h2 className="text-xl font-bold text-white">Welcome to sch00l</h2>
        <p className="mt-2 text-sm text-zinc-400">
          We comply with COPPA and FERPA-friendly practices. Confirm your age to
          continue.
        </p>

        <label className="block mt-6 text-sm text-zinc-300">
          Birth year
          <input
            type="number"
            required
            min={1990}
            max={new Date().getFullYear()}
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-white focus:border-brand-400 focus:outline-none"
          />
        </label>

        {under13 && (
          <label className="mt-4 flex items-start gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={parental}
              onChange={(e) => setParental(e.target.checked)}
              className="mt-1"
            />
            <span>
              I am a parent/guardian, or I have parent/guardian permission to use
              sch00l (required for users under 13).
            </span>
          </label>
        )}

        <label className="mt-4 flex items-start gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            required
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-1"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="text-brand-400 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-brand-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-brand-500 py-3 font-medium text-white hover:bg-brand-400"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
