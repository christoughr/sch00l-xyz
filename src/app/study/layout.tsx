import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { ContentShield } from "@/components/ContentShield";

export const metadata: Metadata = {
  title: "Study session — sch00l.ai",
  description:
    "AI study tutor with course-linked lessons. Subscription required for full lesson access.",
  openGraph: {
    title: "Study with sch00l.ai",
    description: "AI that helps you actually study — not cheat.",
    url: `${SITE_URL}/study`,
  },
};

export default function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ContentShield>{children}</ContentShield>;
}
