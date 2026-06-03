"use client";

import Link from "next/link";
import {
  MessageSquare,
  Zap,
  BookOpen,
  Target,
  UserRound,
  Globe,
} from "lucide-react";

const CHIPS = [
  {
    href: "/my-classes",
    icon: MessageSquare,
    label: "Discussion",
    color: "text-violet-400",
  },
  {
    href: "/practice",
    icon: BookOpen,
    label: "Practice tests",
    color: "text-sky-400",
  },
  {
    href: "/my-classes",
    icon: Zap,
    label: "Live battles",
    color: "text-amber-400",
  },
  {
    href: "/outcomes",
    icon: Target,
    label: "Learning lift",
    color: "text-brand-400",
  },
  {
    href: "/tutors",
    icon: UserRound,
    label: "Human tutors",
    color: "text-emerald-400",
  },
  {
    href: "/community",
    icon: Globe,
    label: "127+ curricula",
    color: "text-zinc-400",
  },
] as const;

export function StudyFeatureStrip() {
  return (
    <div className="overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
      <div className="flex gap-2 min-w-max">
        {CHIPS.map(({ href, icon: Icon, label, color }) => (
          <Link
            key={label}
            href={href}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:border-white/20 hover:bg-white/10 hover:text-white transition shrink-0"
          >
            <Icon className={`h-3.5 w-3.5 ${color}`} />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
