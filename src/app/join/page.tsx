import Link from "next/link";
import { ComingSoonBanner } from "@/components/ComingSoonBanner";
import { JoinClassroom } from "@/components/JoinClassroom";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function JoinPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Join a class</h1>
      {!configured ? (
        <>
          <ComingSoonBanner feature="Classroom join codes" />
          <p className="text-sm text-zinc-400">
            Teachers will share a code here once accounts launch. For now, study
            solo — your progress still saves locally.
          </p>
          <Link
            href="/study"
            className="mt-6 inline-block text-brand-400 hover:underline text-sm"
          >
            Start studying →
          </Link>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-zinc-400">
            Enter the 6-character code from your teacher.
          </p>
          <div className="mt-8">
            <JoinClassroom />
          </div>
        </>
      )}
    </div>
  );
}
