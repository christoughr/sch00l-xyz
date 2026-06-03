import { PRICING } from "./pricing";
import { STORAGE_KEYS } from "./storage-keys";

const KEY = STORAGE_KEYS.dailySessions;
const PRO_KEY = STORAGE_KEYS.proBeta;
export const PRO_STATUS_UPDATED = "sch00l-pro-status-updated";

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

/** Pro unlock: Stripe success page or legacy beta flag */
export function isProUser(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRO_KEY) === "1";
}

/** Call after Stripe Checkout success (local until account sync) */
export function activateProLocal(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRO_KEY, "1");
  window.dispatchEvent(new CustomEvent(PRO_STATUS_UPDATED));
}

export async function refreshProStatusFromServer(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch("/api/payments/pro-status", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { isPro?: boolean };
    if (data.isPro) {
      activateProLocal();
      return true;
    }
  } catch {
    // Keep the existing local state when the cloud check is unavailable.
  }
  return false;
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

/** Undo a session slot when abandoning before meaningful use */
export function unrecordSessionStart(): void {
  if (isProUser()) return;
  const r = loadRecord();
  if (r.count > 0) saveRecord({ date: todayKey(), count: r.count - 1 });
}

export function freeTierLimitMessage(): string {
  return `Free plan: ${PRICING.free.aiSessionsPerDay} AI sessions per day. Upgrade to Pro for unlimited.`;
}
