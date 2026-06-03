"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function CopyShareLink({
  url,
  message,
}: {
  url: string;
  message?: string;
}) {
  const [copied, setCopied] = useState(false);
  const text = message ?? url;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      trackEvent("share_copy", { url });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this text:", text);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-2 text-sm text-zinc-300 hover:bg-white/5"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-400" />
          Copied!
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" />
          Copy share link
        </>
      )}
    </button>
  );
}
