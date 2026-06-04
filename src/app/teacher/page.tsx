import Link from "next/link";
import { TeacherPortal } from "@/components/TeacherPortal";
import { TeacherPilotGuide } from "@/components/TeacherPilotGuide";
import { TeacherGoogleConnectedNotice } from "@/components/TeacherGoogleConnectedNotice";
import { ComingSoonBanner } from "@/components/ComingSoonBanner";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function TeacherPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Teacher portal</h1>
        <p className="mt-2 text-zinc-400">
          Classrooms, student progress, learning lift, and waitlist — built for
          school pilots and acquirer demos.
        </p>
      </div>
      {!configured ? (
        <>
          <ComingSoonBanner feature="Teacher dashboard" />
          <div className="mt-6">
            <TeacherPilotGuide />
          </div>
          <p className="mt-6 text-sm text-zinc-400">
            Launching with student study first. Teacher tools activate when cloud
            accounts go live.
          </p>
          <Link
            href="/study"
            className="mt-4 inline-block text-brand-400 hover:underline text-sm"
          >
            Preview student experience →
          </Link>
        </>
      ) : (
        <>
          <TeacherGoogleConnectedNotice />
          <TeacherPilotGuide />
          <div className="mt-8">
            <TeacherPortal />
          </div>
        </>
      )}
    </div>
  );
}
