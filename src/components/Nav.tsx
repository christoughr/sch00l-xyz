"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "./AuthProvider";
import { dueFlashcards, loadFlashcards } from "@/lib/flashcards-local";
import { isProUser } from "@/lib/free-tier";
import { FLASHCARDS_UPDATED } from "@/lib/flashcards-events";

type NavLink = { href: string; label: string; showDue?: boolean };

const primaryLinks: NavLink[] = [
  { href: "/study", label: "Study" },
  { href: "/my-classes", label: "Classes" },
  { href: "/practice", label: "Practice" },
  { href: "/flashcards", label: "Cards", showDue: true },
  { href: "/progress", label: "Progress" },
];

const moreLinks: NavLink[] = [
  { href: "/community", label: "Community" },
  { href: "/tutors", label: "Tutors" },
  { href: "/pricing", label: "Pricing" },
  { href: "/outcomes", label: "Outcomes" },
];

export function Nav() {
  const { user, loading, signOut, supabaseReady } = useAuth();
  const [isTeacher, setIsTeacher] = useState(false);
  const [cardsDue, setCardsDue] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pro, setPro] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  useEffect(() => {
    setPro(isProUser());
    const onStorage = () => setPro(isProUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function refreshDue() {
    setCardsDue(dueFlashcards(loadFlashcards()).length);
  }

  useEffect(() => {
    refreshDue();
    window.addEventListener(FLASHCARDS_UPDATED, refreshDue);
    return () => window.removeEventListener(FLASHCARDS_UPDATED, refreshDue);
  }, []);

  useEffect(() => {
    if (!user || !supabaseReady) {
      setIsTeacher(false);
      return;
    }
    fetch("/api/teacher/me")
      .then((r) => r.json())
      .then((d) => setIsTeacher(!!d.isTeacher))
      .catch(() => setIsTeacher(false));
  }, [user, supabaseReady]);

  const mobileLinks: NavLink[] = [
    ...primaryLinks,
    ...moreLinks,
    { href: "/settings", label: "Settings" },
    ...(supabaseReady ? [{ href: "/join", label: "Join" }] : []),
    ...(isTeacher ? [{ href: "/teacher", label: "Teach" }] : []),
  ];

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function LinkItem({ l, onNavigate }: { l: NavLink; onNavigate?: () => void }) {
    return (
      <Link
        href={l.href}
        onClick={onNavigate}
        className="relative rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
      >
        {l.label}
        {l.showDue && cardsDue > 0 && (
          <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
            {cardsDue > 9 ? "9+" : cardsDue}
          </span>
        )}
      </Link>
    );
  }

  return (
    <header className="border-b border-white/10 bg-surface-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Logo />

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {primaryLinks.map((l) => (
            <LinkItem key={l.href} l={l} />
          ))}
          {pro && (
            <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-300">
              Pro
            </span>
          )}
          <details className="relative group">
            <summary
              className="list-none cursor-pointer rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
              aria-haspopup="menu"
            >
              More
            </summary>
            <div className="absolute right-0 mt-1 min-w-[140px] rounded-xl border border-white/10 bg-surface-900 py-1 shadow-xl">
              {moreLinks.map((l) => (
                <LinkItem key={l.href} l={l} />
              ))}
              {supabaseReady && <LinkItem l={{ href: "/join", label: "Join" }} />}
              {isTeacher && <LinkItem l={{ href: "/teacher", label: "Teach" }} />}
            </div>
          </details>

          {!loading && supabaseReady && (
            <>
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:text-white"
                >
                  Sign in
                </Link>
              )}
            </>
          )}

          <Link
            href="/study"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-400"
          >
            Study
          </Link>
        </nav>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/study"
            className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white"
          >
            Study
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-lg border border-white/10 p-2 text-zinc-300"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="relative z-50 md:hidden border-t border-white/10 px-4 py-3 space-y-1 bg-surface-900">
          {mobileLinks.map((l) => (
            <LinkItem key={l.href} l={l} onNavigate={() => setMenuOpen(false)} />
          ))}
          {!loading && supabaseReady && (
            <>
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    void handleSignOut();
                  }}
                  disabled={signingOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-zinc-300"
                >
                  Sign in
                </Link>
              )}
            </>
          )}
        </nav>
        </>
      )}
    </header>
  );
}
