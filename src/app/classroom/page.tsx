import Link from "next/link";
import { Video, Users, Calendar } from "lucide-react";

export default function ClassroomPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Live classroom & tutoring</h1>
      <p className="mt-3 text-zinc-400">
        Host tutor sessions or school classes over video. Full auto-scheduling
        (Zoom API / Google Calendar Meet) is on the roadmap — for now, create a
        room and share the link with your class.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <a
          href="https://zoom.us/start/videomeeting"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-brand-400/40"
        >
          <Video className="h-8 w-8 text-brand-400" />
          <h2 className="mt-4 text-lg font-semibold text-white">Start Zoom meeting</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Opens Zoom to host a new meeting. Share the invite link with students
            after matching on sch00l.
          </p>
        </a>
        <a
          href="https://meet.google.com/new"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-brand-400/40"
        >
          <Calendar className="h-8 w-8 text-brand-400" />
          <h2 className="mt-4 text-lg font-semibold text-white">Start Google Meet</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Instant Meet link for tutor or classroom sessions. Works with Google
            Workspace or personal Gmail.
          </p>
        </a>
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
        <Users className="h-7 w-7 text-brand-400" />
        <h2 className="mt-3 text-lg font-semibold text-white">School plan</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Classroom video + roster analytics is included in the school plan ($29/student/mo).
          Contact us for district SSO and embedded Meet/Zoom API integration.
        </p>
        <Link
          href="/pricing"
          className="mt-4 inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-400"
        >
          View pricing
        </Link>
      </div>
    </div>
  );
}
