"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/settings";

export interface AuthFormLabels {
  emailLabel: string;
  passwordLabel: string;
  nameLabel?: string;
  submitLabel: string;
  switchText?: string;
  switchHref?: string;
  switchLabel?: string;
  emailRequired: string;
  passwordRequired: string;
  nameRequired?: string;
  errorEmailRegistered: string;
  errorInvalid: string;
  errorGeneric: string;
}

type Mode = "login" | "register";

export function AuthForm({
  locale,
  mode,
  labels,
}: {
  locale: Locale;
  mode: Mode;
  labels: AuthFormLabels;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mapError = useCallback(
    (detail: string | null | undefined) => {
      if (detail === "auth.errorInvalid") return labels.errorInvalid;
      if (detail === "auth.errorEmailRegistered") return labels.errorEmailRegistered;
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
    if (!password.trim() || password.length < 6) {
      setError(labels.passwordRequired);
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError(labels.nameRequired ?? labels.errorGeneric);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(mapError(data.detail));
        setLoading(false);
        return;
      }
      router.push(`/${locale}/catalog`);
      router.refresh();
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

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-night transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "…" : labels.submitLabel}
      </button>

      {labels.switchText && labels.switchHref && labels.switchLabel && (
        <p className="mt-4 text-center text-sm text-muted">
          {labels.switchText}{" "}
          <a href={labels.switchHref} className="text-accent hover:underline">
            {labels.switchLabel}
          </a>
        </p>
      )}
    </form>
  );
}