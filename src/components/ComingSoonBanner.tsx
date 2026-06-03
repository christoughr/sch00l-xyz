import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function ComingSoonBanner({
  feature = "Accounts & cloud sync",
}: {
  feature?: string;
}) {
  if (isSupabaseConfigured()) return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 mb-6">
      <strong className="text-amber-200">{feature}</strong> — coming soon. You can
      still{" "}
      <Link href="/study" className="underline text-brand-300">
        study now
      </Link>
      ; progress saves in your browser.
    </div>
  );
}
