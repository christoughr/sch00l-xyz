"use client";



import { useEffect, useState } from "react";

import Link from "next/link";

import { BarChart2, TrendingUp, Users, Clock } from "lucide-react";

import { OUTCOMES_DEMO_SESSIONS } from "@/lib/outcomes-demo";



type OutcomesData = {

  mode: "demo" | "cloud" | "local";

  message?: string;

  disclaimer?: string;

  periodDays?: number;

  sessionsCompleted?: number | null;

  sessionsTracked?: number | null;

  averageLiftPercent?: number | null;

  totalStudyMinutes?: number | null;

  liftSampleSize?: number;

};



function Stat({

  icon: Icon,

  label,

  value,

  sub,

}: {

  icon: React.ComponentType<{ className?: string }>;

  label: string;

  value: string;

  sub?: string;

}) {

  return (

    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

      <Icon className="h-5 w-5 text-brand-400 mb-3" />

      <p className="text-2xl font-semibold text-white">{value}</p>

      <p className="text-sm text-zinc-400">{label}</p>

      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}

    </div>

  );

}



export default function OutcomesPage() {

  const [data, setData] = useState<OutcomesData | null>(null);



  useEffect(() => {

    fetch("/api/outcomes")

      .then((r) => r.json())

      .then(setData)

      .catch(() =>
        setData({
          mode: "demo",
          disclaimer:
            "Could not load live stats — showing illustrative demo data.",
        })
      );

  }, []);



  const isDemo = data?.mode === "demo";

  const isCloud = data?.mode === "cloud";

  const showStats = isDemo || isCloud;



  return (

    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-white">Learning outcomes</h1>

        <p className="mt-2 text-zinc-400 max-w-xl">

          sch00l measures what matters: pre-quiz → tutor → post-quiz{" "}

          <strong className="text-zinc-300">learning lift</strong>, not answer dumps.

        </p>

      </div>



      {!data ? (

        <div className="h-32 animate-pulse rounded-2xl bg-white/5" />

      ) : showStats ? (

        <div className="space-y-6">

          {isDemo && (

            <p className="text-sm text-amber-200/90 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">

              {data.disclaimer ??

                "Early beta snapshot — illustrative. Your personal lift is on Progress."}

            </p>

          )}

          {isCloud && (

            <p className="text-sm text-zinc-500">

              Last {data.periodDays} days (anonymous aggregate)

            </p>

          )}

          <div className="grid gap-4 sm:grid-cols-2">

            <Stat

              icon={Users}

              label="Sessions tracked"

              value={String(data.sessionsTracked ?? 0)}

            />

            <Stat

              icon={BarChart2}

              label="Sessions completed"

              value={String(data.sessionsCompleted ?? 0)}

            />

            <Stat

              icon={TrendingUp}

              label="Avg learning lift"

              value={

                data.averageLiftPercent != null

                  ? `${data.averageLiftPercent >= 0 ? "+" : ""}${data.averageLiftPercent}%`

                  : "—"

              }

              sub={

                data.liftSampleSize

                  ? `n=${data.liftSampleSize} pre/post pairs`

                  : undefined

              }

            />

            <Stat

              icon={Clock}

              label="Study time"

              value={`${data.totalStudyMinutes ?? 0} min`}

            />

          </div>



          {isDemo && (

            <section>

              <h2 className="text-lg font-semibold text-white mb-3">

                Example sessions

              </h2>

              <ul className="space-y-2">

                {OUTCOMES_DEMO_SESSIONS.map((s) => (

                  <li

                    key={s.topic}

                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm flex flex-wrap justify-between gap-2"

                  >

                    <span className="text-zinc-300">{s.topic}</span>

                    <span className="text-brand-300">

                      {s.pre}% → {s.post}% (

                      {s.lift >= 0 ? "+" : ""}

                      {s.lift} lift)

                    </span>

                  </li>

                ))}

              </ul>

            </section>

          )}

        </div>

      ) : (

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-4">

          <p className="text-zinc-300">

            {data.message ?? "Stats loading…"}

          </p>

          <Link

            href="/progress"

            className="inline-block rounded-xl bg-brand-500 px-5 py-2 text-sm text-white hover:bg-brand-400"

          >

            View your progress

          </Link>

        </div>

      )}



      <section className="mt-12 rounded-2xl border border-brand-400/20 bg-brand-500/5 p-6">

        <h2 className="text-lg font-semibold text-white">How we measure lift</h2>

        <ol className="mt-4 space-y-2 text-sm text-zinc-400 list-decimal list-inside">

          <li>Pre-quiz baseline (3 questions on your topic)</li>

          <li>Socratic AI tutor session (no homework cheating)</li>

          <li>Post-quiz — same difficulty, new questions</li>

          <li>Lift = post % − pre % (shown on Progress)</li>

        </ol>

        <Link

          href="/study"

          className="mt-6 inline-block text-brand-400 hover:underline text-sm"

        >

          Try a session →

        </Link>

      </section>

    </div>

  );

}


