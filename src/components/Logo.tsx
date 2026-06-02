import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const text = size === "sm" ? "text-lg" : "text-xl";
  return (
    <Link href="/" className={`font-bold tracking-tight ${text}`}>
      <span className="text-brand-400">sch</span>
      <span className="text-white">00</span>
      <span className="text-brand-300">l</span>
      <span className="text-zinc-500 text-sm font-normal">.xyz</span>
    </Link>
  );
}
