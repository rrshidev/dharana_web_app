"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TELEGRAM_BOT_URL } from "@/lib/constants";

export interface LinkTelegramLabels {
  title: string;
  subtitle: string;
  step1: string;
  step2: string;
  step3: string;
  openBot: string;
  codePlaceholder: string;
  confirm: string;
  cancel: string;
  codeRequired: string;
  invalid: string;
  expired: string;
  failed: string;
  success: string;
}

export function LinkTelegram({ labels }: { labels: LinkTelegramLabels }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError(labels.codeRequired);
      return;
    }
    setError(null);
    setSuccess(null);
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
      setSuccess(labels.success);
      setLoading(false);
      router.refresh();
    } catch {
      setError(labels.failed);
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setCode(""); setError(null); setSuccess(null); }}
        className="flex w-full items-center justify-between rounded-2xl border border-night-line bg-white/[0.02] px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04]"
      >
        <span className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="#0088CC" className="h-5 w-5 shrink-0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
          </svg>
          <span>
            <span className="block text-sm font-semibold">{labels.title}</span>
            <span className="block text-xs text-muted">{labels.subtitle}</span>
          </span>
        </span>
        <span className="text-muted">›</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl border border-night-line bg-[#1a1b2e] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">{labels.title}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
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

            <a
              href={`${TELEGRAM_BOT_URL}?start=auth`}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-night-line bg-transparent px-4 py-2.5 text-sm font-semibold text-[#0088CC] transition-colors hover:bg-white/[0.03]"
            >
              {labels.openBot}
            </a>

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
            {success && (
              <p className="mt-3 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400">
                {success}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-night-line px-4 py-2 text-sm font-semibold text-muted hover:text-ink"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-night disabled:opacity-50"
              >
                {loading ? "…" : labels.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}