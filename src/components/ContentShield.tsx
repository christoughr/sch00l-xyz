"use client";

import { useEffect, useState } from "react";

/**
 * Best-effort content protection for paid lesson pages.
 * Browsers cannot fully block OS-level screenshots or external monitors (no Netflix HDCP on web).
 * This deters casual copying, screen capture in-tab, and multi-monitor mirroring signals.
 */
export function ContentShield({ children }: { children: React.ReactNode }) {
  const [blocked, setBlocked] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setBlocked(true);
        setReason("Tab hidden — content protected while away.");
      } else {
        setBlocked(false);
        setReason(null);
      }
    };

    const onBlur = () => {
      setBlocked(true);
      setReason("Window unfocused — resume viewing on this screen.");
    };

    const onFocus = () => {
      setBlocked(false);
      setReason(null);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        setBlocked(true);
        setReason("Screenshots are not permitted on paid content.");
        e.preventDefault();
      }
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) {
        setBlocked(true);
        setReason("Screenshots are not permitted on paid content.");
      }
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        setReason("Printing paid content is disabled.");
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", onCopy);

    let captureStream: MediaStream | null = null;
    const detectCapture = async () => {
      if (!navigator.mediaDevices?.getDisplayMedia) return;
      try {
        const md = navigator.mediaDevices as MediaDevices & {
          addEventListener?: (type: string, fn: () => void) => void;
        };
        if (typeof md.addEventListener === "function") {
          md.addEventListener("devicechange", () => {
            setBlocked(true);
            setReason("Display change detected — content hidden.");
          });
        }
      } catch {
        /* ignore */
      }
    };
    void detectCapture();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", onCopy);
      captureStream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="content-shield relative">
      {children}
      {blocked && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black px-6 text-center"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-lg font-semibold text-white">Content protected</p>
          <p className="mt-2 max-w-md text-sm text-zinc-400">
            {reason ??
              "Recording and screenshots are not allowed. Return to this window to continue."}
          </p>
          <button
            type="button"
            className="mt-6 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white"
            onClick={() => {
              setBlocked(false);
              setReason(null);
            }}
          >
            I understand — show content
          </button>
        </div>
      )}
    </div>
  );
}
