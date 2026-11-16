"use client";

import { useCallback, useEffect, useState } from "react";

type MaxWebApp = {
  initData?: string;
  initDataUnsafe?: { start_param?: string };
  ready?: () => void;
  expand?: () => void;
  close?: () => void;
};

declare global {
  interface Window {
    WebApp?: MaxWebApp;
  }
}

export interface MaxMiniAppLabels {
  confirming: string;
  success: string;
  already: string;
  error: string;
  notInMax: string;
  openBot: string;
}

type State =
  | { kind: "loading" }
  | { kind: "success" }
  | { kind: "already" }
  | { kind: "error" }
  | { kind: "outside" };

const SESSION_RE = /^[a-f0-9]{16,64}$/i;

function readInitData(): { initData: string | null; startParam: string | null } {
  const webapp = typeof window === "undefined" ? undefined : window.WebApp;

  let initData = webapp?.initData?.trim() || null;
  if (!initData && typeof window !== "undefined" && window.location.hash.length > 1) {
    // Запасной путь из документации MAX: данные лежат во фрагменте URL.
    initData =
      new URLSearchParams(window.location.hash.slice(1)).get("WebAppData") ?? null;
  }

  let startParam = webapp?.initDataUnsafe?.start_param ?? null;
  if (!startParam && typeof window !== "undefined") {
    startParam =
      new URLSearchParams(window.location.search).get("WebAppStartParam") ?? null;
  }
  if (!startParam && initData) {
    startParam = new URLSearchParams(initData).get("start_param");
  }

  return { initData, startParam };
}

/**
 * Экран подтверждения входа внутри мини-приложения MAX.
 *
 * MAX Bridge может подгрузиться позже нашего бандла, поэтому несколько раз
 * пробуем прочитать initData. Подпись проверяет бэкенд — здесь только
 * передаём данные и показываем статус.
 */
export function MaxMiniApp({
  botUrl,
  labels,
}: {
  botUrl: string;
  labels: MaxMiniAppLabels;
}) {
  const [state, setState] = useState<State>({ kind: "loading" });

  const run = useCallback(
    async (attempt = 0): Promise<void> => {
      const { initData, startParam } = readInitData();

      if (!initData) {
        if (attempt < 10) {
          window.setTimeout(() => {
            void run(attempt + 1);
          }, 300);
          return;
        }
        setState({ kind: "outside" });
        return;
      }

      const sessionId = (startParam ?? "").replace(/^login_/, "").trim();
      if (!SESSION_RE.test(sessionId)) {
        setState({ kind: "error" });
        return;
      }

      try {
        const res = await fetch("/api/max/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, init_data: initData }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          detail?: string;
        };

        if (res.ok && data.ok) {
          setState({ kind: "success" });
          return;
        }
        if (data.detail === "MAX_SESSION_USED") {
          setState({ kind: "already" });
          return;
        }
        setState({ kind: "error" });
      } catch {
        setState({ kind: "error" });
      }
    },
    [],
  );

  useEffect(() => {
    window.WebApp?.ready?.();
    window.WebApp?.expand?.();
    void run();
  }, [run]);

  const text =
    state.kind === "loading"
      ? labels.confirming
      : state.kind === "success"
        ? labels.success
        : state.kind === "already"
          ? labels.already
          : state.kind === "error"
            ? labels.error
            : labels.notInMax;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center rounded-2xl border border-night-line bg-night/60 px-6 py-10 text-center">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-night-highlight ring-1 ring-inset ring-night-line">
        {state.kind === "loading" ? (
          <span
            aria-hidden="true"
            className="h-5 w-5 animate-spin rounded-full border-2 border-accent/40 border-t-accent"
          />
        ) : state.kind === "success" || state.kind === "already" ? (
          <span aria-hidden="true" className="text-xl text-accent">
            ✓
          </span>
        ) : (
          <span aria-hidden="true" className="text-xl text-red-400">
            !
          </span>
        )}
      </div>

      <p className="text-sm leading-6 text-muted">{text}</p>

      {state.kind === "outside" && botUrl && (
        <a
          href={botUrl}
          className="mt-5 inline-flex items-center justify-center rounded-full border border-night-line px-5 py-2 text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          {labels.openBot}
        </a>
      )}
    </div>
  );
}
