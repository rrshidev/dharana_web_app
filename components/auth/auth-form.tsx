"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/settings";
import { reachGoal } from "@/lib/analytics/metrica";
import { LEGAL } from "@/lib/legal/config";

export interface AuthFormLabels {
  emailLabel: string;
  passwordLabel: string;
  nameLabel?: string;
  submitLabel: string;
  switchText?: string;
  switchHref?: string;
  switchLabel?: string;
  forgotHref?: string;
  forgotLabel?: string;
  emailRequired: string;
  passwordRequired: string;
  nameRequired?: string;
  passwordTooShort?: string;
  emailInvalid?: string;
  emailDisposable?: string;
  emailNotDeliverable?: string;
  nameTooLong?: string;
  errorEmailRegistered: string;
  errorInvalid: string;
  errorGeneric: string;
  consentPrefix?: string;
  consentLink?: string;
  consentMiddle?: string;
  privacyLink?: string;
  consentRequired?: string;
}

type Mode = "login" | "register";

export function AuthForm({
  locale,
  mode,
  labels,
  nextUrl,
}: {
  locale: Locale;
  mode: Mode;
  labels: AuthFormLabels;
  nextUrl?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mapError = useCallback(
    (detail: string | null | undefined) => {
      if (detail === "auth.errorInvalid") return labels.errorInvalid;
      if (detail === "auth.errorEmailRegistered" || detail === "Email already registered")
        return labels.errorEmailRegistered;
      if (detail === "PASSWORD_TOO_SHORT")
        return labels.passwordTooShort ?? labels.errorGeneric;
      if (detail === "EMAIL_INVALID") return labels.emailInvalid ?? labels.errorGeneric;
      if (detail === "EMAIL_DISPOSABLE") return labels.emailDisposable ?? labels.errorGeneric;
      if (detail === "EMAIL_NOT_DELIVERABLE")
        return labels.emailNotDeliverable ?? labels.errorGeneric;
      if (detail === "NAME_TOO_LONG") return labels.nameTooLong ?? labels.errorGeneric;
      return labels.errorGeneric;
    },
    [labels],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(labels.emailRequired);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(labels.emailInvalid ?? labels.emailRequired);
      return;
    }
    if (!password) {
      setError(labels.passwordRequired);
      return;
    }
    if (mode === "register" && password.length < 8) {
      setError(labels.passwordTooShort ?? labels.passwordRequired);
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError(labels.nameRequired ?? labels.errorGeneric);
      return;
    }
    if (mode === "register" && name.trim().length > 60) {
      setError(labels.nameTooLong ?? labels.errorGeneric);
      return;
    }
    if (mode === "register" && !consent) {
      setError(labels.consentRequired ?? labels.errorGeneric);
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, string | boolean> = {
        email: email.trim(),
        password,
        name: name.trim(),
      };
      if (mode === "register") {
        payload.website = website;
        payload.consent = true;
        payload.consent_version = LEGAL.version;
      }
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(mapError(data.detail));
        setLoading(false);
        return;
      }
      const target = nextUrl || `/${locale}/catalog`;
      if (mode === "register") reachGoal("register");
      window.location.assign(target);
    } catch {
      setError(labels.errorGeneric);
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-sm rounded-2xl border border-night-line bg-night/60 p-8"
    >
      {mode === "register" && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-muted">
            {labels.nameLabel}
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-night-line bg-night px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
          />
        </label>
      )}

      {mode === "register" && (
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">
            Website
            <input
              id="website"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>
      )}

      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-medium text-muted">
          {labels.emailLabel}
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-night-line bg-night px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-medium text-muted">
          {labels.passwordLabel}
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-night-line bg-night px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
        />
      </label>

      {mode === "register" &&
        labels.consentPrefix &&
        labels.consentLink &&
        labels.consentMiddle &&
        labels.privacyLink && (
          <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-night-line accent-accent"
            />
            <span>
              {labels.consentPrefix}{" "}
              <Link
                href={`/${locale}/consent`}
                className="text-accent-ink underline underline-offset-2 hover:no-underline"
              >
                {labels.consentLink}
              </Link>{" "}
              {labels.consentMiddle}{" "}
              <Link
                href={`/${locale}/privacy`}
                className="text-accent-ink underline underline-offset-2 hover:no-underline"
              >
                {labels.privacyLink}
              </Link>
              .
            </span>
          </label>
        )}

      {labels.forgotHref && labels.forgotLabel && (
        <p className="mt-2 text-right text-sm">
          <a href={labels.forgotHref} className="text-accent-ink hover:underline">
            {labels.forgotLabel}
          </a>
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-on transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "…" : labels.submitLabel}
      </button>

      {labels.switchText && labels.switchHref && labels.switchLabel && (
        <p className="mt-4 text-center text-sm text-muted">
          {labels.switchText}{" "}
          <a href={labels.switchHref} className="text-accent-ink hover:underline">
            {labels.switchLabel}
          </a>
        </p>
      )}
    </form>
  );
}