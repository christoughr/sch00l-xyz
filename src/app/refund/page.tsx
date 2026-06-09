import Link from "next/link";
import { LEGAL_EMAIL, SITE_DOMAIN } from "@/lib/site";
import { PRICING, formatUsd } from "@/lib/pricing";

export default function RefundPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Billing policy</h1>
      <p className="text-zinc-400 text-sm mt-2">Last updated: June 2026 · {SITE_DOMAIN}</p>

      <section className="mt-8 space-y-4 text-zinc-300 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold text-white">No free trial</h2>
        <p>
          sch00l does not offer free trials on membership, curriculum libraries,
          single courses, bundles, family plans, or school seats. All paid plans
          are charged at checkout.
        </p>

        <h2 className="text-lg font-semibold text-white pt-4">All sales final</h2>
        <p>
          Subscriptions and curriculum library purchases are non-refundable.
          There is no cooling-off period and no money-back guarantee. By
          subscribing, you agree that fees are earned when access is granted.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Membership, curriculum libraries, and bundle charges are final</li>
          <li>Annual plans are billed in full for the term selected</li>
          <li>You may cancel renewal anytime; access continues through the paid period</li>
          <li>
            Billing questions:{" "}
            <a href={`mailto:${LEGAL_EMAIL}`} className="text-brand-400 hover:underline">
              {LEGAL_EMAIL}
            </a>
          </li>
        </ul>

        <h2 className="text-lg font-semibold text-white pt-4">Human tutors</h2>
        <p>
          Human tutor sessions ({formatUsd(PRICING.humanTutor.rateFrom)}–
          {formatUsd(PRICING.humanTutor.rateTo)}/hr) are non-refundable once
          the session is completed and approved.
        </p>

        <h2 className="text-lg font-semibold text-white pt-4">Billing status</h2>
        <p>
          Paid subscriptions are opening soon. Until checkout is live, all
          courses remain free to preview. See{" "}
          <Link href="/pricing" className="text-brand-400 hover:underline">
            pricing
          </Link>{" "}
          for current rates.
        </p>
      </section>
    </article>
  );
}
