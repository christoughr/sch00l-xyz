"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function Inner() {
  const params = useSearchParams();
  const connected = params.get("connected");

  if (connected !== "google") return null;

  return (
    <div
      className="mb-6 rounded-xl border border-brand-400/40 bg-brand-500/10 px-4 py-3 text-sm text-brand-200"
      role="status"
    >
      Google Classroom connected. Open a class →{" "}
      <strong className="text-white">Integrations</strong> tab to sync.
      <Link
        href="/teacher"
        className="ml-2 text-brand-300 hover:underline"
        onClick={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("connected");
          url.searchParams.delete("tab");
          window.history.replaceState({}, "", url.pathname);
        }}
      >
        Dismiss
      </Link>
    </div>
  );
}

export function TeacherGoogleConnectedNotice() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
