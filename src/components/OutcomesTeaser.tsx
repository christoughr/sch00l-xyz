"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

type OutcomesPreview = {
  mode: string;
  averageLiftPercent?: number | null;
  liftSampleSize?: number;
};

export function OutcomesTeaser() {
  const [data, setData] = useState<OutcomesPreview | null>(null);

  useEffect(() => {
    fetch("/api/outcomes")
      .then((r) => r.json())
      .then(setData)
      .catch(() => null);
  }, []);

  if (data?.averageLiftPercent == null) return null;

  return (
    <Link
      href="/outcomes"
      className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-brand-400/25 bg-brand-500/10 px-5 py-4 text-sm transition hover:bg-brand-500/15"
    >
      <TrendingUp className="h-5 w-5 text-brand-400 shrink-0" />
      <span className="text-zinc-300">
        Early beta: avg learning lift{" "}
        <strong className="text-brand-300">
          +{data.averageLiftPercent}%
        </strong>
        {data.liftSampleSize ? ` (n=${data.liftSampleSize})` : ""} · see outcomes →
      </span>
    </Link>
  );
}
