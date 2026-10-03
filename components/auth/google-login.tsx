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
          prompt: (cb?: (res: unknown) => void) => void;
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
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!clientId) {
      setReady(false);
      return;
    }
    let cancelled = false;

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

    loadGsiScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredential,
        });
        // Запасной путь: официальная кнопка живёт невидимой (см. handleClick).
        if (hiddenRef.current) {
          window.google.accounts.id.renderButton(hiddenRef.current, {
            theme: "outline",
            size: "large",
            shape: "pill",
            text: "signin_with",
            width: 280,
          });
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, labels, locale, nextUrl]);

  /**
   * Кнопку Google рисуем сами (контурный знак в стиле остальных соцкнопок),
   * а официальный renderButton держим рядом невидимым: по клику сначала
   * пробуем prompt() (аккаунт-выбор/One Tap), а если его нет — кликаем iframe.
   * Так мы не зависим от фирменного вида iframe, но и не теряем флоу Google.
   */
  const handleClick = () => {
    const gsi = window.google?.accounts?.id;
    if (!gsi) {
      setError(labels.failed);
      return;
    }
    if (typeof gsi.prompt === "function") {
      gsi.prompt();
      return;
    }
    hiddenRef.current?.querySelector("iframe")?.click();
  };

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

      <div className="mx-auto w-full max-w-sm">
        <SocialButton network="google" width="full" disabled={!ready} onClick={handleClick}>
          {labels.button}
        </SocialButton>
        {error && (
          <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
            {error}
          </p>
        )}
        <div
          ref={hiddenRef}
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        />
      </div>
    </>
  );
}