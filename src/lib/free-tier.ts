import { PRICING } from "./pricing";

const KEY = "sch00l_daily_sessions";
const PRO_KEY = "sch00l_pro_beta";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

type DailyRecord = { date: string; count: number };

function loadRecord(): DailyRecord {
  if (typeof window === "undefined") return { date: todayKey(), count: 0 };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null") as DailyRecord | null;
    if (!raw || raw.date !== todayKey()) return { date: todayKey(), count: 0 };
    return raw;
  } catch {
    return { date: todayKey(), count: 0 };
  }
}

function saveRecord(r: DailyRecord): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(r));
}

/** Beta: Pro unlock via localStorage until Stripe */
export function isProUser(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRO_KEY) === "1";
}

export function sessionsUsedToday(): number {
  return loadRecord().count;
}

export function sessionsRemainingToday(): number {
  if (isProUser()) return Infinity;
  return Math.max(0, PRICING.free.aiSessionsPerDay - loadRecord().count);
}

export function canStartSession(): boolean {
  return isProUser() || loadRecord().count < PRICING.free.aiSessionsPerDay;
}

export function recordSessionStart(): void {
  if (isProUser()) return;
  const r = loadRecord();
  saveRecord({ date: todayKey(), count: r.count + 1 });
}

export function freeTierLimitMessage(): string {
  return `Free plan: ${PRICING.free.aiSessionsPerDay} AI sessions per day. Upgrade to Pro for unlimited.`;
}
