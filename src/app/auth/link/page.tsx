"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

function ConfirmSignIn() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") ?? "magiclink";
  const next = searchParams.get("next") ?? "/study";
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function confirmSignIn() {
    if (!tokenHash) return;
    setStatus("loading");
    setMessage("");

    const res = await fetch("/api/auth/verify-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token_hash: tokenHash, type }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      redirect?: string;
    };

    if (!res.ok) {
      setStatus("error");
      setMessage(
        data.error ??
          "This link expired or was already used. Request a new magic link."
      );
      return;
    }

    const dest =
      data.redirect ??
      (next.startsWith("/") ? next : "/study");
    router.replace(dest);
    router.refresh();
  }

  if (!tokenHash) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <Logo />
        <p className="mt-8 text-red-400 text-sm">Invalid sign-in link.</p>
        <Link href="/login" className="mt-4 inline-block text-brand-400 underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Logo />
      <h1 className="mt-8 text-2xl font-bold text-white">Confirm sign-in</h1>
      <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
        Gmail and security scanners sometimes open links automatically and burn
        one-time tokens. Tap the button below to finish signing in.
      </p>
      <button
        type="button"
        onClick={confirmSignIn}
        disabled={status === "loading"}
        className="mt-8 w-full rounded-xl bg-brand-500 py-3 font-medium text-white hover:bg-brand-400 disabled:opacity-50"
      >
        {status === "loading" ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        ) : (
          "Continue to sch00l"
        )}
      </button>
      {message && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {message}{" "}
          <Link href="/login" className="underline text-brand-300">
            Get a new link
          </Link>
        </p>
      )}
    </div>
  );
}

export default function AuthLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-zinc-400">Loading…</div>
      }
    >
      <ConfirmSignIn />
    </Suspense>
  );
}
