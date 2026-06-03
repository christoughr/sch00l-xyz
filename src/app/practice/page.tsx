"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, Loader2 } from "lucide-react";
import { PracticeTestRunner } from "@/components/PracticeTestRunner";

type Test = {
  id: string;
  label: string;
  examFamily: string;
  region: string;
  durationMinutes: number;
  sectionCount: number;
};

export default function PracticePage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/practice/tests")
      .then((r) => r.json())
      .then((d) => setTests(d.tests ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (activeTestId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <PracticeTestRunner
          testId={activeTestId}
          onExit={() => setActiveTestId(null)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <ClipboardList className="h-8 w-8 text-brand-400" />
          Practice tests
        </h1>
        <p className="mt-2 text-zinc-400">
          Timed exam-style practice — SAT, ACT, AP, and more.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        </div>
      ) : tests.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-zinc-400">No practice tests available yet.</p>
          <Link
            href="/study"
            className="mt-4 inline-block text-brand-400 hover:underline text-sm"
          >
            Try a study session →
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {tests.map((t) => (
            <li
              key={t.id}
              className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col"
            >
              <h2 className="font-semibold text-white">{t.label}</h2>
              <p className="mt-1 text-xs text-zinc-500">
                {t.examFamily} · {t.region} · {t.sectionCount} sections
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                {t.durationMinutes} minutes
              </p>
              <button
                type="button"
                onClick={() => setActiveTestId(t.id)}
                className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400 self-start"
              >
                Start test
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
