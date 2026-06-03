"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { activateProLocal } from "@/lib/free-tier";
import { trackEvent } from "@/lib/analytics";

export default function ProSuccessPage() {
  useEffect(() => {
    activateProLocal();
    trackEvent("pro_activated", { source: "checkout_success" });
  }, []);

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
