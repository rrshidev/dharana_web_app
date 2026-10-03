"use client";

import { useState } from "react";
import { TELEGRAM_BOT_URL } from "@/lib/constants";
import { SocialButton, SocialLink } from "@/components/brand/social-button";

export interface TelegramLoginLabels {
  or: string;
  button: string;
  title: string;
  step1: string;
  step2: string;
  step3: string;
  openBot: string;
  codePlaceholder: string;
  login: string;
  cancel: string;
  codeRequired: string;
  invalid: string;
  expired: string;
  failed: string;
}

export function TelegramLogin({
  locale,
  labels,
  nextUrl,
  hideDivider = false,
}: {
  locale: string;
  labels: TelegramLoginLabels;
  nextUrl?: string;
  hideDivider?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError(labels.codeRequired);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/telegram/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        let msg = labels.failed;
        if (data.detail === "auth.errorTelegramInvalid") msg = labels.invalid;
        else if (data.detail === "auth.errorTelegramExpired") msg = labels.expired;
        setError(msg);
        setLoading(false);
        return;
      }
      const target = nextUrl || `/${locale}/catalog`;
      window.location.assign(target);
    } catch {
      setError(labels.failed);
      setLoading(false);
    }
  };

  return (
    <>
      {!hideDivider && (
        <div className="mx-auto my-6 flex w-full max-w-sm items-center gap-3">
          <div className="h-px flex-1 bg-night-line" />
          <span className="text-xs text-muted">{labels.or}</span>
          <div className="h-px flex-1 bg-night-line" />
        </div>
      )}

      <div className="mx-auto w-full max-w-sm">
        <SocialButton network="telegram" width="full" onClick={() => setOpen(true)}>
          {labels.button}
        </SocialButton>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl border border-night-line bg-night p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">{labels.title}</h3>
              <button
                type="button"
                onClick={() => { setOpen(false); setError(null); }}
                className="rounded-lg px-2 py-1 text-muted hover:text-ink"
                aria-label={labels.cancel}
              >
                ✕
              </button>
            </div>

            <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-muted">
              <li>{labels.step1}</li>
              <li>{labels.step2}</li>
              <li>{labels.step3}</li>
            </ol>

            <div className="mb-4">
              <SocialLink
                network="telegram"
                external
                width="full"
                href={`${TELEGRAM_BOT_URL}?start=auth`}
              >
                {labels.openBot}
              </SocialLink>
            </div>

            <label className="block">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                placeholder={labels.codePlaceholder}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                className="w-full rounded-xl border border-night-line bg-night/60 px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
              />
            </label>

            {error && (
              <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setOpen(false); setError(null); }}
                className="rounded-xl border border-night-line px-4 py-2 text-sm font-semibold text-muted hover:text-ink"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-on disabled:opacity-50"
              >
                {loading ? "…" : labels.login}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
