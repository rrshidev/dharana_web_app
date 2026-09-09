"use client";

import { useEffect, useRef, useState } from "react";

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
  const btnRef = useRef<HTMLDivElement>(null);
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

    const renderButtonAtWidth = () => {
      if (!window.google?.accounts?.id || !btnRef.current) return;
      const width = Math.max(280, Math.floor(btnRef.current.getBoundingClientRect().width) || 280);
      if (Math.abs(width - lastWidth) < 1) return;
      lastWidth = width;
      window.google.accounts.id.renderButton(btnRef.current, {
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
    if (btnRef.current) ro.observe(btnRef.current);

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

      <div className="mx-auto w-full max-w-sm">
        <div ref={btnRef} className="google-btn" />
        {error && (
          <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
            {error}
          </p>
        )}
        {!ready && (
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-full border border-night-line bg-transparent px-6 py-2.5 text-sm font-semibold text-muted"
          >
            {labels.button}
          </button>
        )}
      </div>
    </>
  );
}