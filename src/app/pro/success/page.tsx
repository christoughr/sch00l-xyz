"use client";

import Link from "next/link";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { activateProLocal, refreshProStatusFromServer } from "@/lib/free-tier";
import { trackEvent } from "@/lib/analytics";

function ProSuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState<"loading" | "ok" | "pending">("loading");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (sessionId) {
        try {
          const res = await fetch(
            `/api/payments/verify-success?session_id=${encodeURIComponent(sessionId)}`
          );
          const data = await res.json();
          if (!cancelled && data.verified) {
            activateProLocal();
            trackEvent("pro_activated", { source: "stripe_verify" });
            setState("ok");
            return;
          }
        } catch {
          // Fall through to the account-level Pro status check.
        }
      }

      const serverPro = await refreshProStatusFromServer();
      if (!cancelled && serverPro) {
        trackEvent("pro_activated", { source: "subscription_status" });
        setState("ok");
        return;
      }

      if (!cancelled) setState("pending");
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400 mx-auto" />
        <p className="mt-4 text-sm text-zinc-400">Confirming your purchase…</p>
      </div>
    );
  }

  if (state === "pending") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Almost there</h1>
        <p className="mt-3 text-zinc-400 text-sm">
          Pro unlocks only after a verified checkout or active subscription.
          Opening this URL directly won&apos;t activate Pro. If you just paid with
          Lemon Squeezy, sign in with the same email, wait a minute for the
          webhook, then refresh — or join the waitlist on Pricing.
        </p>
        <Link
          href="/pricing"
          className="mt-8 inline-block rounded-xl border border-white/15 px-6 py-3 text-sm text-zinc-300 hover:bg-white/5"
        >
          Back to pricing
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/20 text-brand-300 mb-6">
        <Check className="h-7 w-7" />
      </div>
      <p className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs text-brand-300 mb-4">
        <Sparkles className="h-3 w-3" />
        Pro unlocked
      </p>
      <h1 className="text-2xl font-bold text-white">Welcome to sch00l Pro</h1>
      <p className="mt-3 text-zinc-400 text-sm">
        Unlimited AI sessions are active on this device. Sign in with the same
        email after Supabase is connected to sync Pro across devices.
      </p>
      <Link
        href="/study"
        className="mt-8 inline-block rounded-xl bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-400"
      >
        Start studying
      </Link>
    </div>
  );
}

export default function ProSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-400 mx-auto" />
        </div>
      }
    >
      <ProSuccessContent />
    </Suspense>
  );
}
