"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  canUseApp,
  isUnder13,
  loadLocalConsent,
  saveLocalConsent,
  type AgeConsent,
} from "@/lib/compliance";

const LEGAL_PATHS = ["/privacy", "/terms"];

export function AgeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [consent, setConsent] = useState<AgeConsent | null>(null);
  const [ready, setReady] = useState(false);
  const [birthYear, setBirthYear] = useState("");
  const [parental, setParental] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");

  const isLegalPage = LEGAL_PATHS.includes(pathname);
  const year = parseInt(birthYear, 10);
  const under13 = !Number.isNaN(year) && isUnder13(year);

  useEffect(() => {
    setConsent(loadLocalConsent());
    setReady(true);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (Number.isNaN(year) || year < 1920 || year > new Date().getFullYear()) {
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
    })
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          console.warn("Profile sync:", (d as { error?: string }).error ?? res.status);
        }
      })
      .catch(() => {});
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="h-8 w-8 animate-pulse rounded-full bg-brand-500/30" />
      </div>
    );
  }

  if (isLegalPage) return <>{children}</>;
  if (consent && canUseApp(consent)) return <>{children}</>;

  return (
    <>
      <div className="invisible h-0 overflow-hidden" aria-hidden inert>
        {children}
      </div>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-900 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
      >
        <form
          onSubmit={submit}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-800 p-8 shadow-2xl"
        >
          <h2 id="age-gate-title" className="text-xl font-bold text-white">
            Welcome to sch00l
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            We comply with COPPA and FERPA-friendly practices. Confirm your age
            to continue.
          </p>

          <label htmlFor="birth-year" className="block mt-6 text-sm text-zinc-300">
            Birth year
            <input
              id="birth-year"
              type="number"
              required
              min={1920}
              max={new Date().getFullYear()}
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-white focus:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            />
          </label>

          {under13 && (
            <label className="mt-4 flex items-start gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={parental}
                onChange={(e) => setParental(e.target.checked)}
                className="mt-1 shrink-0"
              />
              <span>
                I am a parent/guardian, or I have parent/guardian permission to
                use sch00l (required for users under 13).
              </span>
            </label>
          )}

          <div className="mt-4 flex items-start gap-3 text-sm text-zinc-300">
            <input
              id="terms-check"
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-1 shrink-0"
            />
            <label htmlFor="terms-check">
              I agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 underline hover:text-brand-300"
              >
                Terms
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 underline hover:text-brand-300"
              >
                Privacy Policy
              </a>
              .
            </label>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-brand-500 py-3 font-medium text-white hover:bg-brand-400 focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            Continue
          </button>
        </form>
      </div>
    </>
  );
}
