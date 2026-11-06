"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/settings";
import {
  COOKIE_SETTINGS_EVENT,
  readCookieConsent,
  writeCookieConsent,
} from "@/lib/legal/consent-store";

export type CookieConsentLabels = {
  title: string;
  text: string;
  policyLink: string;
  acceptAll: string;
  necessaryOnly: string;
  closeLabel: string;
};

export function CookieConsent({
  locale,
  labels,
}: {
  locale: Locale;
  labels: CookieConsentLabels;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!readCookieConsent());
    const open = () => setVisible(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, open);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, open);
  }, []);

  const decide = (analytics: boolean) => {
    writeCookieConsent(analytics);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-text"
      className="fixed inset-x-0 bottom-0 z-[70] p-3 sm:p-5"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-night-line bg-night-soft p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="cookie-consent-title" className="text-base font-semibold tracking-tight sm:text-lg">
            {labels.title}
          </h2>
          <button
            type="button"
            onClick={() => decide(false)}
            aria-label={labels.closeLabel}
            className="shrink-0 rounded-full p-1 text-muted transition-colors hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p id="cookie-consent-text" className="mt-2 text-sm leading-6 text-muted">
          {labels.text}{" "}
          <Link href={`/${locale}/privacy`} className="text-accent-ink underline underline-offset-2 hover:no-underline">
            {labels.policyLink}
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => decide(false)}
            className="rounded-full border border-night-line px-5 py-2 text-sm font-medium text-ink transition-colors hover:border-accent/60"
          >
            {labels.necessaryOnly}
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-on transition-opacity hover:opacity-90"
          >
            {labels.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}
