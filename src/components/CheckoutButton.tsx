"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";

type Plan = "pro" | "tutor_hour";

export function CheckoutButton({
  plan,
  label,
  highlight,
  fallbackHref,
  fallbackLabel,
}: {
  plan: Plan;
  label: string;
  highlight?: boolean;
  fallbackHref: string;
  fallbackLabel: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    trackEvent("checkout_start", { plan });

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.fallbackUrl) {
        window.location.href = data.fallbackUrl;
        return;
      }

      setError(data.error ?? "Checkout unavailable");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={`w-full rounded-xl py-3 text-sm font-medium disabled:opacity-60 ${
          highlight
            ? "bg-brand-500 text-white hover:bg-brand-400"
            : "border border-white/15 text-zinc-300 hover:bg-white/5"
        }`}
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </span>
        ) : (
          label
        )}
      </button>
      {error && (
        <p className="mt-2 text-xs text-amber-300 text-center">
          {error}.{" "}
          <Link href={fallbackHref} className="underline">
            {fallbackLabel}
          </Link>
        </p>
      )}
    </div>
  );
}
