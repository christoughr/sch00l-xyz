"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useAuth } from "./AuthProvider";

const links = [
  { href: "/study", label: "Study" },
  { href: "/flashcards", label: "Cards" },
  { href: "/progress", label: "Progress" },
  { href: "/join", label: "Join" },
];

export function Nav() {
  const { user, loading, signOut, supabaseReady } = useAuth();
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsTeacher(false);
      return;
    }
    fetch("/api/teacher/me")
      .then((r) => r.json())
      .then((d) => setIsTeacher(!!d.isTeacher))
      .catch(() => setIsTeacher(false));
  }, [user]);

  return (
    <header className="border-b border-white/10 bg-surface-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-2 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white sm:px-3"
            >
              {l.label}
            </Link>
          ))}
          {isTeacher && (
            <Link
              href="/teacher"
              className="rounded-lg px-2 py-2 text-sm text-brand-300 hover:bg-brand-500/10 sm:px-3"
            >
              Teach
            </Link>
          )}

          {!loading && (
            <>
              {user ? (
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="hidden sm:flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-white"
                  title={user.email ?? "Account"}
                >
                  <User className="h-4 w-4" />
                  <LogOut className="h-3 w-3" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg px-2 py-2 text-sm text-zinc-300 hover:text-white sm:px-3"
                >
                  {supabaseReady ? "Sign in" : "Login"}
                </Link>
              )}
            </>
          )}

          <Link
            href="/study"
            className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-400 sm:px-4"
          >
            Study
          </Link>
        </nav>
      </div>
    </header>
  );
}
