"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/settings";

export interface ForgotPasswordLabels {
  sendTitle: string;
  sendText: string;
  emailLabel: string;
  emailRequired: string;
  emailInvalid: string;
  sendButton: string;
  sent: string;
  sentHint: string;
  sendFailed: string;
  frequency: string;
  goLogin: string;
}

export function ForgotPasswordForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: ForgotPasswordLabels;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const value = email.trim();
    if (!value) {
      setError(labels.emailRequired);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(labels.emailInvalid);
      return;
    }

    setState("sending");
    try {
      const res = await fetch("/api/auth/password-reset/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = (await res.json().catch(() => ({}))) as { detail?: string };
      if (res.status === 429) {
        setState("failed");
        setError(labels.frequency);
        return;
      }
      if (!res.ok) {
        setState("failed");
        setError(data.detail ?? labels.sendFailed);
        return;
      }
      setState("sent");
    } catch {
      setState("failed");
      setError(labels.sendFailed);
    }
  };

  if (state === "sent") {
    return (
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-night-line bg-night/60 p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/15 text-sage">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
            <path d="m4.5 12.5 5 5 10-11" />
          </svg>
        </span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">{labels.sent}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{labels.sentHint}</p>
        <a
          href={`/${locale}/login`}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-night transition-opacity hover:opacity-90"
        >
          {labels.goLogin}
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-sm rounded-2xl border border-night-line bg-night/60 p-8"
    >
      <h2 className="text-xl font-semibold tracking-tight">{labels.sendTitle}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{labels.sendText}</p>

      <label className="mt-5 block">
        <span className="mb-1 block text-sm font-medium text-muted">{labels.emailLabel}</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-night-line bg-night px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
        />
      </label>

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-6 w-full rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-night transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {state === "sending" ? "…" : labels.sendButton}
      </button>
    </form>
  );
}