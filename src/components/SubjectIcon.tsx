import {
  Sigma,
  FlaskConical,
  PenLine,
  Hourglass,
  Braces,
  Languages,
  TrendingUp,
  Brain,
  Globe2,
  Gem,
  Palette,
  Music2,
  Briefcase,
  Cog,
  HeartPulse,
  ChartColumn,
  Landmark,
  CircleDot,
  type LucideIcon,
} from "lucide-react";
import type { SubjectId } from "@/lib/subject-ids";

const ICONS: Record<SubjectId, LucideIcon> = {
  math: Sigma,
  science: FlaskConical,
  english: PenLine,
  history: Hourglass,
  cs: Braces,
  languages: Languages,
  economics: TrendingUp,
  psychology: Brain,
  geography: Globe2,
  philosophy: Gem,
  art: Palette,
  music: Music2,
  business: Briefcase,
  engineering: Cog,
  health: HeartPulse,
  statistics: ChartColumn,
  social_studies: Landmark,
  other: CircleDot,
};

export function SubjectIcon({
  id,
  className = "h-5 w-5",
  selected = false,
}: {
  id: SubjectId | string;
  className?: string;
  selected?: boolean;
}) {
  const Icon = ICONS[id as SubjectId] ?? CircleDot;
  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
        selected
          ? "bg-brand-500/25 text-brand-300"
          : "bg-white/10 text-zinc-300"
      }`}
    >
      <Icon className={className} strokeWidth={1.75} aria-hidden />
    </span>
  );
}
