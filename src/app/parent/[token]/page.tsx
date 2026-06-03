"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Loader2, TrendingUp, Users } from "lucide-react";

type ParentData = {
  readOnly: boolean;
  student: { displayName: string; emailMasked: string };
  stats: {
    streakDays: number;
    totalMinutes: number;
    totalSessions: number;
    averageLiftPercent: number | null;
    liftSampleSize: number;
  };
  classrooms: { classroomId: string; name: string }[];
  linkCreatedAt: string;
};

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <Icon className="h-5 w-5 text-brand-400 mb-2" />
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}

export default function ParentDashboardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [token, setToken] = useState("");
  const [data, setData] = useState<ParentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/parent/${token}`)
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Invalid link");
        setData(json);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Could not load dashboard")
      )
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-red-400">{error ?? "Link not found"}</p>
        <Link href="/" className="mt-4 inline-block text-brand-400 hover:underline">
          Go to sch00l →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
        Parent dashboard · read-only
      </p>
      <h1 className="text-2xl font-bold text-white">
        {data.student.displayName}
      </h1>
      <p className="text-sm text-zinc-500 mt-1">{data.student.emailMasked}</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
        <Stat
          icon={Clock}
          label="Study time"
          value={`${data.stats.totalMinutes} min`}
        />
        <Stat
          icon={Users}
          label="Sessions"
          value={String(data.stats.totalSessions)}
        />
        <Stat
          icon={TrendingUp}
          label="Avg learning lift"
          value={
            data.stats.averageLiftPercent != null
              ? `${data.stats.averageLiftPercent >= 0 ? "+" : ""}${data.stats.averageLiftPercent}%`
              : "—"
          }
        />
        <Stat
          icon={Clock}
          label="Streak"
          value={`${data.stats.streakDays} days`}
        />
      </div>

      {data.stats.liftSampleSize > 0 && (
        <p className="mt-4 text-xs text-zinc-500">
          Lift based on {data.stats.liftSampleSize} pre/post quiz pairs
        </p>
      )}

      {data.classrooms.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">Classes</h2>
          <ul className="space-y-2">
            {data.classrooms.map((c) => (
              <li
                key={c.classroomId}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300"
              >
                {c.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-10 text-xs text-zinc-600">
        Link created {new Date(data.linkCreatedAt).toLocaleDateString()}. No
        account required — this view is read-only.
      </p>
    </div>
  );
}
