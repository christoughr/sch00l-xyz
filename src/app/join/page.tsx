import { JoinClassroom } from "@/components/JoinClassroom";

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Join a class</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Enter the 6-character code from your teacher to sync your study progress
        to their dashboard.
      </p>
      <div className="mt-8">
        <JoinClassroom />
      </div>
    </div>
  );
}
