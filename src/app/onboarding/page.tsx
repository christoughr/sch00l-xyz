"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { OnboardingForm } from "@/components/OnboardingForm";
import { useAuth } from "@/components/AuthProvider";

export default function OnboardingPage() {
  const { user, loading, supabaseReady } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabaseReady) {
      setReady(true);
      return;
    }

    if (loading) {
      const t = setTimeout(() => setReady(true), 4000);
      return () => clearTimeout(t);
    }

    if (!user) {
      router.replace("/login?next=/onboarding");
      return;
    }

    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile?.onboarding_complete) {
          router.replace("/study");
        } else {
          setReady(true);
        }
      })
      .catch(() => setReady(true));
  }, [user, loading, supabaseReady, router]);

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        <p className="text-sm text-zinc-500">Loading your account…</p>
      </div>
    );
  }

  if (!user && supabaseReady) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-zinc-400 text-sm">Session not found.</p>
        <Link href="/login" className="mt-4 inline-block text-brand-400 underline">
          Sign in again
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Quick setup</h1>
      <p className="mt-2 text-zinc-400 text-sm">
        One minute — then straight into your first study session.
      </p>
      <div className="mt-8">
        <OnboardingForm />
      </div>
    </div>
  );
}
