import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center text-sm text-zinc-500 sm:flex-row sm:justify-between sm:text-left">
        <p>
          sch00l.xyz — learn the material, not the shortcut.{" "}
          <span className="text-zinc-600">Built for students.</span>
        </p>
        <nav className="flex flex-wrap justify-center gap-4">
          <Link href="/privacy" className="hover:text-zinc-300">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-zinc-300">
            Terms
          </Link>
          <Link href="/settings" className="hover:text-zinc-300">
            Settings
          </Link>
          <Link href="/teacher" className="hover:text-zinc-300">
            Teachers
          </Link>
        </nav>
      </div>
    </footer>
  );
}
