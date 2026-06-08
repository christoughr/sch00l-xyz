import Link from "next/link";
import { LEGAL_EMAIL, SITE_DOMAIN } from "@/lib/site";
import { PRICING, formatUsd } from "@/lib/pricing";

export default function RefundPage() {
  const refund = PRICING.refund;
  const trial = PRICING.trial;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Refund & trial policy</h1>
      <p className="text-zinc-400 text-sm mt-2">Last updated: June 2026 · {SITE_DOMAIN}</p>

      <section className="mt-8 space-y-4 text-zinc-300 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold text-white">Free trial</h2>
        <p>
          New subscribers may receive a {trial.days}-day free trial on their
          first curriculum library purchase. Cancel before the trial ends and you
          will not be charged. One trial per household.
        </p>

        <h2 className="text-lg font-semibold text-white pt-4">Refunds</h2>
        <p>
          If you are not satisfied, contact us within {refund.days} days of your
          first paid subscription charge for a full refund. Email{" "}
          <a href={`mailto:${LEGAL_EMAIL}`} className="text-brand-400 hover:underline">
            {LEGAL_EMAIL}
          </a>{" "}
          from the address on your account and include your sch00l username or
          receipt.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          {refund.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
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
          for planned rates.
        </p>
      </section>
    </article>
  );
}
