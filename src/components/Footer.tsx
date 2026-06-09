import Link from "next/link";
import { LEGACY_DOMAIN, SITE_DOMAIN } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center text-sm text-zinc-500 sm:flex-row sm:justify-between sm:text-left">
        <p>
          {SITE_DOMAIN} — learn the material, not the shortcut.{" "}
          <span className="text-zinc-600 hidden sm:inline">
            ({LEGACY_DOMAIN} redirects here)
          </span>
          <span className="text-zinc-600 block sm:inline sm:ml-1">
            Built for students.
          </span>
        </p>
        <nav className="flex flex-wrap justify-center gap-4">
          <Link href="/study" className="hover:text-zinc-300">
            Study
          </Link>
          <Link href="/progress" className="hover:text-zinc-300">
            Progress
          </Link>
          <Link href="/notebook" className="hover:text-zinc-300">
            Notebook
          </Link>
          <Link href="/privacy" className="hover:text-zinc-300">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-zinc-300">
            Terms
          </Link>
          <Link href="/refund" className="hover:text-zinc-300">
            Billing
          </Link>
          <Link href="/settings" className="hover:text-zinc-300">
            Settings
          </Link>
          <Link href="/teacher" className="hover:text-zinc-300" title="Educators & pilot schools">
            For educators
          </Link>
          <Link href="/outcomes" className="hover:text-zinc-300">
            Outcomes
          </Link>
          <Link href="/pricing" className="hover:text-zinc-300">
            Pricing
          </Link>
          <Link href="/tutors" className="hover:text-zinc-300">
            Tutors
          </Link>
        </nav>
      </div>
    </footer>
  );
}
