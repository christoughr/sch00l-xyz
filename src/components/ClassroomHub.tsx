"use client";

import { useState } from "react";
import { ClassroomStats } from "./TeacherPortal";
import { ClassroomAssignments } from "./ClassroomAssignments";
import { ClassroomBattle } from "./ClassroomBattle";
import { ClassroomForum } from "./ClassroomForum";
import { ClassroomIntegrations } from "./ClassroomIntegrations";
import { ClassroomAnnouncements } from "./ClassroomAnnouncements";
import { ClassLiftChart } from "./ClassLiftChart";
import { DocLibrary } from "./DocLibrary";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "assign", label: "Assign" },
  { id: "battle", label: "Live battle" },
  { id: "forum", label: "Forum" },
  { id: "integrations", label: "Integrations" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function ClassroomHub({
  classroomId,
  students,
  initialTab = "overview",
}: {
  classroomId: string;
  students: { id: string; email: string }[];
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === t.id
                ? "bg-brand-500 text-white"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <ClassroomAnnouncements classroomId={classroomId} />
          <ClassroomStats classroomId={classroomId} />
          <ClassLiftChart classroomId={classroomId} />
        </>
      )}
      {tab === "assign" && (
        <>
          <ClassroomAssignments classroomId={classroomId} students={students} />
          <DocLibrary classroomId={classroomId} />
        </>
      )}
      {tab === "battle" && <ClassroomBattle classroomId={classroomId} />}
      {tab === "forum" && <ClassroomForum classroomId={classroomId} />}
      {tab === "integrations" && (
        <ClassroomIntegrations classroomId={classroomId} />
      )}
    </div>
  );
}
