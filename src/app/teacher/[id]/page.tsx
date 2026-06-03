import { TeacherClassroomPage } from "@/components/TeacherClassroomPage";

export default async function ClassroomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <TeacherClassroomPage classroomId={id} />
    </div>
  );
}
