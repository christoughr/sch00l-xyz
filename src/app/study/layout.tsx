import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Study session — sch00l.ai",
  description:
    "Free AI study tutor: pre-quiz, Socratic chat, post-quiz, and flashcards. No account required.",
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
  return children;
}
