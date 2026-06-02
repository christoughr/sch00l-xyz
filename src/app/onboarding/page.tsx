"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { OnboardingForm } from "@/components/OnboardingForm";
import { useAuth } from "@/components/AuthProvider";

export default function OnboardingPage() {
  const { user, loading, supabaseReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!supabaseReady || loading) return;
    if (!user) {
      router.replace("/login?next=/onboarding");
      return;
    }
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile?.onboarding_complete) {
          router.replace("/study");
        }
      });
  }, [user, loading, supabaseReady, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
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
