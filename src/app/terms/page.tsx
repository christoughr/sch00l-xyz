import Link from "next/link";
import { LEGAL_EMAIL, SITE_DOMAIN } from "@/lib/site";

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
      <p className="text-zinc-400 text-sm mt-2">Last updated: June 2026 · {SITE_DOMAIN}</p>

      <section className="mt-8 space-y-4 text-zinc-300 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold text-white">Educational use</h2>
        <p>
          sch00l is a study aid. You agree to use it to learn—not to submit AI
          output as your own work without permission from your instructor.
        </p>

        <h2 className="text-lg font-semibold text-white pt-4">Acceptable use</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>No harassment, spam, or attempts to bypass academic integrity features</li>
          <li>No scraping or automated abuse of the API</li>
          <li>Accurate age and consent information</li>
        </ul>

        <h2 className="text-lg font-semibold text-white pt-4">Accounts</h2>
        <p>
          You are responsible for your account. We may suspend accounts that
          violate these terms or applicable law.
        </p>

        <h2 className="text-lg font-semibold text-white pt-4">Disclaimer</h2>
        <p>
          sch00l is provided &quot;as is.&quot; AI responses may contain errors.
          Always verify important facts with your teacher or course materials.
        </p>

        <h2 className="text-lg font-semibold text-white pt-4">Privacy</h2>
        <p>
          Use of sch00l is also governed by our{" "}
          <Link href="/privacy" className="text-brand-400 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        <h2 className="text-lg font-semibold text-white pt-4">Contact</h2>
        <p>{LEGAL_EMAIL}</p>
      </section>
    </article>
  );
}
