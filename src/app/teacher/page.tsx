import { TeacherPortal } from "@/components/TeacherPortal";

export default function TeacherPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Teacher portal</h1>
        <p className="mt-2 text-zinc-400">
          Classrooms, student progress, learning lift, and waitlist — built for
          school pilots and acquirer demos.
        </p>
      </div>
      <TeacherPortal />
    </div>
  );
}
