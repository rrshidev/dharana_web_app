"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SocialButton, SocialLink } from "@/components/brand/social-button";

export interface MaxLoginLabels {
  or: string;
  button: string;
  title: string;
  step1: string;
  step2: string;
  step3: string;
  open: string;
  waiting: string;
  cancel: string;
  failed: string;
  expired: string;
  notConfigured: string;
}

type Status = "idle" | "creating" | "waiting" | "error";

/**
 * Вход через MAX.
 *
 * У MAX нет OAuth для сторонних сайтов, поэтому схема такая: создаём сессию на
 * API → открываем мини-приложение бота по deep link → оно присылает подписанный
 * initData → сессия подтверждается → этот компонент получает JWT поллингом.
 *
 * Важно: код в чат не отправляется — MAX запрещает авторизационные сообщения
 * через API (п. 1.5 Требований к содержанию и функциональности Приложений).
 */
export function MaxLogin({
  locale,
  labels,
  nextUrl,
  enabled,
  hideDivider = false,
}: {
  locale: string;
  labels: MaxLoginLabels;
  nextUrl?: string;
  enabled: boolean;
  hideDivider?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const close = () => {
    stopPolling();
    setOpen(false);
    setStatus("idle");
    setError(null);
    setDeepLink(null);
  };

  const poll = useCallback(
    async (sessionId: string) => {
      try {
        const res = await fetch(`/api/auth/max/session/${sessionId}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.status === "confirmed" && data.ok) {
          stopPolling();
          window.location.assign(nextUrl || `/${locale}/catalog`);
          return;
        }
        if (data.status === "expired" || data.status === "consumed") {
          stopPolling();
          setStatus("error");
          setError(labels.expired);
        }
      } catch {
        // Сеть мигнула — продолжаем поллинг до истечения сессии.
      }
    },
    [labels.expired, locale, nextUrl, stopPolling],
  );

  const start = async () => {
    setOpen(true);
    setStatus("creating");
    setError(null);
    setDeepLink(null);
    try {
      const res = await fetch("/api/auth/max/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(
          data.detail === "max_not_configured"
            ? labels.notConfigured
            : labels.failed,
        );
        return;
      }

      setDeepLink(data.deep_link as string);
      setStatus("waiting");

      const interval = Math.max(1000, Number(data.poll_interval_ms) || 2000);
      stopPolling();
      timer.current = window.setInterval(() => {
        void poll(data.session_id as string);
      }, interval);
    } catch {
      setStatus("error");
      setError(labels.failed);
    }
  };

  if (!enabled) return null;

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
        <SocialButton
          network="max"
          width="full"
          onClick={start}
        >
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
                onClick={close}
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

            {status === "creating" && (
              <p className="py-2 text-sm text-muted">…</p>
            )}

            {status === "waiting" && deepLink && (
              <>
                <div className="mb-3">
                  <SocialLink
                    network="max"
                    external
                    width="full"
                    href={deepLink}
                  >
                    {labels.open}
                  </SocialLink>
                </div>
                <p className="flex items-center gap-2 text-sm text-muted">
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 animate-spin rounded-full border-2 border-accent/40 border-t-accent"
                  />
                  {labels.waiting}
                </p>
              </>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-xl border border-night-line px-4 py-2 text-sm font-semibold text-muted hover:text-ink"
              >
                {labels.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
