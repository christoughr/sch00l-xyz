"use client";

import { Sparkles } from "lucide-react";
import {
  getLocalStudentContext,
  hasPersonalizationData,
} from "@/lib/student-profile";
import type { SubjectId } from "@/lib/types";

export function StudyPersonalizationBanner({
  subject,
  preScore,
}: {
  subject: SubjectId;
  preScore?: number | null;
}) {
  const ctx = getLocalStudentContext({
    subject,
    preScoreToday: preScore ?? null,
  });

  if (!hasPersonalizationData(ctx)) return null;

  const hints: string[] = [];
  if (ctx.latestLift) hints.push(`Last lift: ${ctx.latestLift}`);
  if (preScore !== null && preScore !== undefined) {
    hints.push(`Today's pre-quiz: ${preScore}%`);
  }
  if (ctx.weakTopics[0]) {
    hints.push(`Building: ${ctx.weakTopics[0].topic}`);
  }
  if (ctx.recentSessionSummaries[0]) {
    const short = ctx.recentSessionSummaries[0].slice(0, 72);
    hints.push(
      short.length < ctx.recentSessionSummaries[0].length ? `${short}…` : short
    );
  }

  return (
    <div className="rounded-xl border border-brand-400/25 bg-brand-500/10 px-4 py-3 flex items-start gap-3 text-sm">
      <Sparkles className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
      <p className="text-zinc-300">
        <span className="text-white font-medium">Your tutor remembers you</span>
        {hints.length > 0 && (
          <span className="text-brand-300"> — {hints.join(" · ")}</span>
        )}
        . Hints and quizzes adapt as you improve.
      </p>
    </div>
  );
}
