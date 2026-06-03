"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export function ExclusiveBattleCta() {
  const { user, loading } = useAuth();
  const [code, setCode] = useState("");

  const loginHref = `/login?redirect=${encodeURIComponent("/exclusive")}`;
  const teacherHref = user ? "/teacher" : loginHref;
  const joinHref = code.trim()
    ? `/battle/${encodeURIComponent(code.trim().toUpperCase())}`
    : "#";

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <Link
        href={teacherHref}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400"
      >
        {loading ? "…" : "Create a battle (teacher)"}
      </Link>
      <div className="flex gap-2 items-center">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Battle code"
          className="rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white w-28 font-mono uppercase"
          maxLength={8}
        />
        <Link
          href={user ? joinHref : loginHref}
          className={`rounded-lg border border-white/15 px-4 py-2 text-sm ${
            code.trim() && user
              ? "text-white hover:bg-white/5"
              : "text-zinc-500 pointer-events-none opacity-50"
          }`}
          aria-disabled={!code.trim() || !user}
        >
          Join battle
        </Link>
      </div>
      {!user && !loading && (
        <p className="w-full text-xs text-zinc-500">
          <Link href={loginHref} className="text-brand-400 hover:underline">
            Sign in
          </Link>{" "}
          to host or join a live battle.
        </p>
      )}
    </div>
  );
}
