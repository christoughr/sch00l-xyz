"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ClassroomHub } from "./ClassroomHub";

type HubTab = "overview" | "assign" | "battle" | "forum" | "integrations";

function TeacherClassroomInner({ classroomId }: { classroomId: string }) {
  const [students, setStudents] = useState<{ id: string; email: string }[]>([]);
  const [classroomName, setClassroomName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = (
    tabParam === "forum" ||
    tabParam === "integrations" ||
    tabParam === "battle" ||
    tabParam === "assign"
      ? tabParam
      : "overview"
  ) as HubTab;

  useEffect(() => {
    fetch(`/api/classrooms/${classroomId}/stats`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Could not load classroom");
        setStudents(
          (data.students ?? []).map((s: { id: string; email: string }) => ({
            id: s.id,
            email: s.email,
          }))
        );
        if (data.classroom?.name) setClassroomName(data.classroom.name);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Could not load classroom")
      )
      .finally(() => setLoading(false));
  }, [classroomId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <>
      <Link
        href="/teacher"
        className="text-sm text-zinc-500 hover:text-zinc-300 mb-6 inline-block"
      >
        ← All classrooms
      </Link>
      {classroomName && (
        <h1 className="text-2xl font-bold text-white mb-6">{classroomName}</h1>
      )}
      <ClassroomHub
        classroomId={classroomId}
        students={students}
        initialTab={initialTab}
      />
    </>
  );
}

export function TeacherClassroomPage({ classroomId }: { classroomId: string }) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        </div>
      }
    >
      <TeacherClassroomInner classroomId={classroomId} />
    </Suspense>
  );
}
