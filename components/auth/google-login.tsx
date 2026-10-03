"use client";

import { useEffect, useRef, useState } from "react";
import { SocialButton } from "@/components/brand/social-button";

export interface GoogleLoginLabels {
  or: string;
  button: string;
  failed: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: {
            client_id: string;
            callback: (resp: { credential?: string }) => void;
          }) => void;
          renderButton: (el: HTMLElement, opts?: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("gsi_load_failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("gsi_load_failed"));
    document.head.appendChild(script);
  });
}

export function GoogleLogin({
  locale,
  clientId,
  labels,
  nextUrl,
  hideDivider = false,
}: {
  locale: string;
  clientId: string;
  labels: GoogleLoginLabels;
  nextUrl?: string;
  hideDivider?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const gsiRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!clientId) {
      setReady(false);
      return;
    }
    let cancelled = false;
    let raf = 0;
    let lastWidth = 0;

    const handleCredential = async (resp: { credential?: string }) => {
      const idToken = resp?.credential;
      if (!idToken) {
        setError(labels.failed);
        return;
      }
      setError(null);
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: idToken }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setError(labels.failed);
          return;
        }
        const target = nextUrl || `/${locale}/catalog`;
        window.location.assign(target);
      } catch {
        setError(labels.failed);
      }
    };

    // Ловушка GSI (обсуждали 2026-09-09): renderButton рисует iframe своей
    // естественной ширины — кнопка съезжает. Поэтому меряем контейнер и
    // перерисовываем при изменении ширины.
    const renderButtonAtWidth = () => {
      if (!window.google?.accounts?.id || !gsiRef.current) return;
      const width =
        Math.max(280, Math.floor(wrapRef.current?.getBoundingClientRect().width ?? 0) || 280);
      if (Math.abs(width - lastWidth) < 1) return;
      lastWidth = width;
      window.google.accounts.id.renderButton(gsiRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
        width,
      });
    };

    loadGsiScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredential,
        });
        renderButtonAtWidth();
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(renderButtonAtWidth);
    });
    if (wrapRef.current) ro.observe(wrapRef.current);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [clientId, labels, locale, nextUrl]);

  if (!clientId) return null;

  return (
    <>
      {!hideDivider && (
        <div className="mx-auto my-6 flex w-full max-w-sm items-center gap-3">
          <div className="h-px flex-1 bg-night-line" />
          <span className="text-xs text-muted">{labels.or}</span>
          <div className="h-px flex-1 bg-night-line" />
        </div>
      )}

      <div
        ref={wrapRef}
        className="relative mx-auto w-full max-w-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-accent/60 rounded-full"
      >
        {/* Слой 1 — настоящая кнопка Google: прозрачная, но кликабельная.
            Так клик настоящий (не синтетический), поэтому вход работает во всех
            браузерах, включая Firefox, где One Tap/prompt молча ничего не
            показывает. Клавиатура и скринридер работают с этим же iframe. */}
        <div
          ref={gsiRef}
          className="absolute inset-0 z-20 flex items-center justify-center opacity-0"
        />
        {/* Слой 2 — наш контурный вид: клики пропускает слою 1, из табуляции
            убран (tabIndex -1), чтобы не было второго фокусируемого контрола. */}
        <div className="pointer-events-none relative z-10" aria-hidden="true">
          <SocialButton network="google" width="full" disabled={!ready} tabIndex={-1}>
            {labels.button}
          </SocialButton>
        </div>
        {error && (
          <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </>
  );
}