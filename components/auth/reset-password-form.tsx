"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/settings";

export interface ResetPasswordLabels {
  title: string;
  newPassword: string;
  confirmPassword: string;
  passwordRequired: string;
  passwordTooShort: string;
  passwordsMismatch: string;
  submit: string;
  success: string;
  successText: string;
  invalid: string;
  invalidText: string;
  error: string;
  requestAgain: string;
  goLogin: string;
}

export function ResetPasswordForm({
  token,
  locale,
  labels,
}: {
  token: string;
  locale: Locale;
  labels: ResetPasswordLabels;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed" | "invalid">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError(labels.passwordRequired);
      return;
    }
    if (password.length < 8) {
      setError(labels.passwordTooShort);
      return;
    }
    if (password !== confirm) {
      setError(labels.passwordsMismatch);
      return;
    }

    setState("sending");
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { detail?: string };
      if (res.status === 400 && data.detail === "resetPassword.invalid") {
        setState("invalid");
        return;
      }
      if (!res.ok) {
        setState("failed");
        setError(data.detail ?? labels.error);
        return;
      }
      setState("sent");
    } catch {
      setState("failed");
      setError(labels.error);
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
        <h2 className="mt-5 text-xl font-semibold tracking-tight">{labels.success}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{labels.successText}</p>
        <a
          href={`/${locale}/login`}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-night transition-opacity hover:opacity-90"
        >
          {labels.goLogin}
        </a>
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-night-line bg-night/60 p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
            <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">{labels.invalid}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{labels.invalidText}</p>
        <a
          href={`/${locale}/reset-password`}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-night transition-opacity hover:opacity-90"
        >
          {labels.requestAgain}
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-sm rounded-2xl border border-night-line bg-night/60 p-8"
    >
      <h2 className="text-xl font-semibold tracking-tight">{labels.title}</h2>

      <label className="mt-5 block">
        <span className="mb-1 block text-sm font-medium text-muted">{labels.newPassword}</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full rounded-lg border border-night-line bg-night px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-medium text-muted">{labels.confirmPassword}</span>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
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
        {state === "sending" ? "…" : labels.submit}
      </button>
    </form>
  );
}