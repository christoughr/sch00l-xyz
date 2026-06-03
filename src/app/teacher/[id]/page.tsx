import Link from "next/link";
import { ClassroomStats } from "@/components/ClassroomStats";

export default async function ClassroomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/teacher"
        className="text-sm text-zinc-500 hover:text-zinc-300 mb-6 inline-block"
      >
        ← All classrooms
      </Link>
      <ClassroomStats classroomId={id} />
    </div>
  );
}
