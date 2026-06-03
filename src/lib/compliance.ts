import { ALL_LOCAL_STORAGE_KEYS, STORAGE_KEYS } from "./storage-keys";

const CONSENT_KEY = STORAGE_KEYS.ageConsent;

export type AgeConsent = {
  birthYear: number;
  isUnder13: boolean;
  parentalConsent: boolean;
  termsAccepted: boolean;
  at: string;
};

export function getAgeFromBirthYear(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}

export function isUnder13(birthYear: number): boolean {
  return getAgeFromBirthYear(birthYear) < 13;
}

export function loadLocalConsent(): AgeConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as AgeConsent) : null;
  } catch {
    return null;
  }
}

export function saveLocalConsent(consent: AgeConsent): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
}

export function clearLocalUserData(): void {
  if (typeof window === "undefined") return;
  ALL_LOCAL_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
}

export function canUseApp(consent: AgeConsent | null): boolean {
  if (!consent?.termsAccepted) return false;
  if (consent.isUnder13 && !consent.parentalConsent) return false;
  return true;
}
