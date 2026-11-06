import { LEGAL } from "./config";

export const COOKIE_CONSENT_KEY = "dharana:cookie-consent";
export const COOKIE_CONSENT_EVENT = "dharana:cookie-consent-change";
export const COOKIE_SETTINGS_EVENT = "dharana:cookie-settings";

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  version: string;
  decidedAt: string;
};

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (typeof parsed.analytics !== "boolean") return null;
    return {
      necessary: true,
      analytics: parsed.analytics,
      version: typeof parsed.version === "string" ? parsed.version : LEGAL.version,
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeCookieConsent(analytics: boolean): CookieConsent {
  const consent: CookieConsent = {
    necessary: true,
    analytics,
    version: LEGAL.version,
    decidedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    } catch {
      // Приватный режим или переполненное хранилище: баннер просто покажется снова.
    }
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: consent }));
  }
  return consent;
}

export function clearCookieConsent() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(COOKIE_CONSENT_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: null }));
}

export function openCookieSettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}

export function subscribeCookieConsent(callback: (consent: CookieConsent | null) => void) {
  if (typeof window === "undefined") return () => {};
  const onChange = (event: Event) => {
    callback((event as CustomEvent<CookieConsent | null>).detail ?? readCookieConsent());
  };
  window.addEventListener(COOKIE_CONSENT_EVENT, onChange);
  return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onChange);
}
