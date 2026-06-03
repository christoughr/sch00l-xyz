import { ProgressDashboard } from "@/components/ProgressDashboard";
import { DailyReviewBanner } from "@/components/DailyReviewBanner";

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <DailyReviewBanner />
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Your progress</h1>
        <p className="mt-2 text-zinc-400">
          Streaks, study time, and mastery — the metrics acquirers actually look
          at.
        </p>
      </div>
      <ProgressDashboard />
    </div>
  );
}
