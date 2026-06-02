import Link from "next/link";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 prose prose-invert prose-zinc max-w-none">
      <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="text-zinc-400 text-sm">Last updated: June 2026 · sch00l.xyz</p>

      <section className="mt-8 space-y-4 text-zinc-300 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold text-white">What we collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Email (if you sign in or join the waitlist)</li>
          <li>Study sessions: subject, minutes, quiz scores, flashcards</li>
          <li>Birth year and consent status (COPPA compliance)</li>
          <li>Optional: display name, grade level, classroom membership</li>
        </ul>

        <h2 className="text-lg font-semibold text-white pt-4">How we use data</h2>
        <p>
          To provide tutoring, track learning progress, power teacher dashboards,
          and improve sch00l. We do not sell personal data. We do not train
          third-party models on your chat content without disclosure.
        </p>

        <h2 className="text-lg font-semibold text-white pt-4">Students under 13 (COPPA)</h2>
        <p>
          Users under 13 require verifiable parental/guardian consent before using
          sch00l. We collect minimal data necessary for the educational service.
          Parents may request deletion by contacting support@sch00l.xyz.
        </p>

        <h2 className="text-lg font-semibold text-white pt-4">Schools (FERPA-aware)</h2>
        <p>
          When used in a classroom pilot, sch00l acts as a service provider.
          Teachers see aggregated progress for enrolled students only. Schools
          should execute a data processing agreement before wide deployment.
        </p>

        <h2 className="text-lg font-semibold text-white pt-4">Your rights</h2>
        <p>
          Export or delete your data anytime at{" "}
          <Link href="/settings" className="text-brand-400 hover:underline">
            Settings
          </Link>
          . EU/UK users may have additional rights under GDPR.
        </p>

        <h2 className="text-lg font-semibold text-white pt-4">Contact</h2>
        <p>privacy@sch00l.xyz</p>
      </section>
    </article>
  );
}
