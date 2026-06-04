"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, LogIn } from "lucide-react";
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

/** Outlined CTA — clearly not a plain nav link; Study stays solid brand purple. */
const signInBtnClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-white bg-transparent px-4 py-2 text-sm font-bold tracking-wide text-white shadow-[0_0_0_1px_rgba(255,255,255,0.35)] transition hover:bg-white hover:text-zinc-900 hover:shadow-md min-h-[44px] shrink-0";

const secondaryLinks: NavLink[] = [
  { href: "/community", label: "Community" },
  { href: "/tutors", label: "Tutors" },
  { href: "/pricing", label: "Pricing" },
  { href: "/outcomes", label: "Outcomes" },
];

export function Nav() {
  const pathname = usePathname();
  const { user, loading, signOut, supabaseReady } = useAuth();
  const [isTeacher, setIsTeacher] = useState(false);
  const [cardsDue, setCardsDue] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pro, setPro] = useState(false);

  function handleSignOut() {
    void signOut();
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
    if (!user) {
      setCardsDue(0);
      return;
    }
    refreshDue();
    window.addEventListener(FLASHCARDS_UPDATED, refreshDue);
    return () => window.removeEventListener(FLASHCARDS_UPDATED, refreshDue);
  }, [user]);

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

  const extraLinks: NavLink[] = [
    ...secondaryLinks,
    ...(supabaseReady ? [{ href: "/join", label: "Join" }] : []),
    ...(isTeacher ? [{ href: "/teacher", label: "Teach" }] : []),
    { href: "/settings", label: "Settings" },
  ];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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

  function LinkItem({
    l,
    onNavigate,
    compact,
  }: {
    l: NavLink;
    onNavigate?: () => void;
    compact?: boolean;
  }) {
    return (
      <Link
        href={l.href}
        onClick={onNavigate}
        className={`relative block rounded-lg text-zinc-300 transition hover:bg-white/5 hover:text-white min-h-[44px] flex items-center ${
          compact
            ? "px-2 py-1.5 text-xs lg:text-sm"
            : "px-3 py-2.5 sm:py-2 text-sm"
        }`}
      >
        {l.label}
        {l.showDue && user && cardsDue > 0 && (
          <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
            {cardsDue > 9 ? "9+" : cardsDue}
          </span>
        )}
      </Link>
    );
  }

  return (
    <header className="border-b border-white/10 bg-surface-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          <Logo />

          {/* Desktop: flat nav, no More dropdown */}
          <nav className="hidden md:flex flex-1 flex-wrap items-center justify-end gap-0.5 lg:gap-1 min-w-0">
            {primaryLinks.map((l) => (
              <LinkItem key={l.href} l={l} compact />
            ))}
            <span className="mx-1 h-4 w-px bg-white/10 hidden lg:block" aria-hidden />
            {secondaryLinks.map((l) => (
              <LinkItem key={l.href} l={l} compact />
            ))}
            {supabaseReady && <LinkItem l={{ href: "/join", label: "Join" }} compact />}
            {isTeacher && <LinkItem l={{ href: "/teacher", label: "Teach" }} compact />}
            {pro && (
              <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-300 ml-1">
                Pro
              </span>
            )}
            {!loading && (
              <div className="flex items-center gap-1.5 ml-1 pl-1 border-l border-white/10">
                {user && supabaseReady ? (
                  <button
                    type="button"
                    data-testid="signout-btn"
                    onClick={handleSignOut}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline">Sign out</span>
                  </button>
                ) : !user ? (
                  <Link href="/login" data-testid="signin-btn" className={signInBtnClass}>
                    <LogIn className="h-4 w-4 shrink-0" aria-hidden />
                    Sign in
                  </Link>
                ) : null}
              </div>
            )}
            <Link
              href="/study"
              className="ml-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-400 shrink-0"
            >
              Study
            </Link>
          </nav>

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden shrink-0">
            {!loading && !user && (
              <Link
                href="/login"
                data-testid="signin-btn"
                className={`${signInBtnClass} px-3 py-2 text-xs sm:text-sm`}
              >
                <LogIn className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Sign in
              </Link>
            )}
            <Link
              href="/study"
              className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white shrink-0"
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
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="relative z-50 md:hidden border-t border-white/10 px-4 py-3 space-y-1 bg-surface-900 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain">
            <p className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Learn
            </p>
            {primaryLinks.map((l) => (
              <LinkItem key={l.href} l={l} onNavigate={() => setMenuOpen(false)} />
            ))}
            <p className="px-3 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Explore
            </p>
            {extraLinks.map((l) => (
              <LinkItem key={l.href} l={l} onNavigate={() => setMenuOpen(false)} />
            ))}
            {!loading && (
              <div className="border-t border-white/10 pt-2 mt-2">
                {user && supabaseReady ? (
                  <button
                    type="button"
                    data-testid="signout-btn"
                    onClick={() => {
                      setMenuOpen(false);
                      void handleSignOut();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                ) : !user ? (
                  <Link
                    href="/login"
                    data-testid="signin-btn"
                    onClick={() => setMenuOpen(false)}
                    className={`${signInBtnClass} w-full`}
                  >
                    <LogIn className="h-4 w-4 shrink-0" aria-hidden />
                    Sign in
                  </Link>
                ) : null}
              </div>
            )}
          </nav>
        </>
      )}
    </header>
  );
}
