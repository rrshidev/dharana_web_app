"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Вход по VK ID через официальный виджет OneTap (@vkid/sdk).
 *
 * Почему виджет, а не редирект руками: VK ID обменивает код на токен по
 * `POST id.vk.ru/oauth2/auth`, и этот запрос требует `device_id`, которого нет
 * в нашем редирект-флоу («device id is missing»). device_id выдаёт только их
 * SDK — вместе с кодом он приходит в payload LOGIN_SUCCESS. Поэтому обмен
 * делает браузер (`VKID.Auth.exchangeCode`, public client, client_secret не
 * нужен), а бэкенд проверяет access_token через /oauth2/user_info.
 */

const SDK_URL = "https://unpkg.com/@vkid/sdk@%3C3.0.0/dist-sdk/umd/index.js";

interface OneTapWidget {
  // Внимание: аргумент обязателен (внутри читается t.fastAuthEnabled), а
  // `container` — это DOM-элемент: базовый renderTemplate делает
  // container.insertAdjacentHTML(...). height допустим 32..56.
  render: (opts: {
    container: HTMLElement;
    lang?: number;
    scheme?: string;
    styles?: { width?: number; height?: number; borderRadius?: number };
    fastAuthEnabled?: boolean;
  }) => unknown;
  on: (event: string, handler: (payload: unknown) => void) => unknown;
  off?: (event: string, handler: (payload: unknown) => void) => unknown;
  close?: () => void;
}

interface VkIdSdk {
  Config: { init: (opts: Record<string, unknown>) => void };
  Languages: Record<string, number>;
  Scheme: Record<string, string>;
  // В 2.6.8 это КЛАСС (`export class OneTap`), а в некоторых сборках — уже
  // готовый инстанс (так написано в сниппете из консоли VK ID).
  OneTap: OneTapWidget & (new () => OneTapWidget);
  OneTapInternalEvents: Record<string, string>;
  WidgetEvents: Record<string, string>;
  Auth: {
    exchangeCode: (code: string, deviceId: string) => Promise<{ access_token?: string }>;
  };
}

declare global {
  interface Window {
    // UMD-бандл @vkid/sdk регистрирует именно VKIDSDK (проверено 2026-10-04:
    // в шапке `(globalThis).VKIDSDK={}`), а не VKID, как в сниппете из консоли.
    VKIDSDK?: VkIdSdk;
    VKID?: VkIdSdk;
  }
}

function getSdk(): VkIdSdk | undefined {
  const sdk = window.VKIDSDK ?? window.VKID;
  return sdk?.OneTap ? sdk : undefined;
}

/** OneTap бывает классом (2.6.8) и готовым инстансом — приводим к инстансу. */
function oneTapInstance(sdk: VkIdSdk): OneTapWidget {
  const exported = sdk.OneTap;
  return typeof exported?.render === "function" ? exported : new exported();
}

function loadVkScript(): Promise<VkIdSdk> {
  return new Promise((resolve, reject) => {
    const ready = getSdk();
    if (ready) {
      resolve(ready);
      return;
    }
    const finish = () => {
      const sdk = getSdk();
      if (sdk) resolve(sdk);
      else reject(new Error("vk_sdk_namespace"));
    };
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
    if (existing) {
      existing.addEventListener("load", finish);
      existing.addEventListener("error", () => reject(new Error("vk_sdk_load")));
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = finish;
    script.onerror = () => reject(new Error("vk_sdk_load"));
    document.head.appendChild(script);
  });
}

export interface VkOneTapLabels {
  failed: string;
}

type State = "loading" | "ready" | "error";

export function VkOneTap({
  locale,
  clientId,
  redirectUrl,
  labels,
  nextUrl,
}: {
  locale: string;
  clientId: string;
  redirectUrl: string;
  labels: VkOneTapLabels;
  nextUrl?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<State>("loading");
  const slotRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<OneTapWidget | null>(null);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    // Страховка: если SDK не пришёл или render() не случился — не оставляем
    // вечный «скелет». Снимается сразу после успешного render().
    const watchdog = setTimeout(() => {
      if (!cancelled) setState("error");
    }, 10000);

    const onSuccess = async (payload: unknown) => {
      const data = (payload ?? {}) as { code?: string; device_id?: string };
      const sdk = getSdk();
      if (!data.code || !data.device_id || !sdk) {
        setError(labels.failed);
        return;
      }
      setError(null);
      try {
        // Обмен кода на токен — на стороне VK, client_secret не участвует.
        const token = await sdk.Auth.exchangeCode(data.code, data.device_id);
        if (cancelled) return;
        const res = await fetch("/api/auth/vk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: token.access_token ?? "" }),
        });
        if (!res.ok) {
          if (!cancelled) setError(labels.failed);
          return;
        }
        window.location.assign(nextUrl || `/${locale}/catalog`);
      } catch {
        if (!cancelled) setError(labels.failed);
      }
    };
    const onDenied = () => setError(labels.failed);
    const onWidgetError = (payload: unknown) => {
      // iframe виджета не загрузился (сеть/CSP/домен) — кнопки не будет.
      console.warn("[vk-one-tap]", payload);
      if (!cancelled) setState("error");
    };

    loadVkScript()
      .then((sdk) => {
        if (cancelled || !slotRef.current) return;
        sdk.Config.init({
          app: Number(clientId),
          redirectUrl,
          responseMode: "Callback",
          // LOWCODE — режим, который VK ID включает для обычных веб-страниц.
          source: "LOWCODE",
          scope: "",
        });
        const widget = oneTapInstance(sdk);
        widgetRef.current = widget;
        const events = sdk.OneTapInternalEvents;
        widget.on(events.LOGIN_SUCCESS, onSuccess);
        if (events.NOT_AUTHORIZED) widget.on(events.NOT_AUTHORIZED, onDenied);
        if (sdk.WidgetEvents?.ERROR) widget.on(sdk.WidgetEvents.ERROR, onWidgetError);
        const width = Math.max(
          240,
          Math.floor(slotRef.current.getBoundingClientRect().width) || 320,
        );
        widget.render({
          container: slotRef.current,
          lang: sdk.Languages?.RUS ?? 0,
          scheme: "light",
          styles: { width, height: 48, borderRadius: 24 },
        });
        clearTimeout(watchdog);
        setState("ready");
      })
      .catch((e) => {
        console.warn("[vk-one-tap] load failed", e);
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
      clearTimeout(watchdog);
      const sdk = getSdk();
      const widget = widgetRef.current;
      if (sdk && widget) {
        try {
          widget.off?.(sdk.OneTapInternalEvents.LOGIN_SUCCESS, onSuccess);
          if (sdk.OneTapInternalEvents.NOT_AUTHORIZED) {
            widget.off?.(sdk.OneTapInternalEvents.NOT_AUTHORIZED, onDenied);
          }
          widget.close?.();
        } catch {
          // ignore
        }
      }
      widgetRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, redirectUrl, locale]);

  if (!clientId || state === "error") {
    return error ? (
      <p className="mx-auto mt-3 w-full max-w-sm rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
        {error}
      </p>
    ) : null;
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Слот под официальную кнопку: SDK вставляет разметку в этот элемент
          (container), поэтому он должен существовать до вызова render(). */}
      <div ref={slotRef} className="flex min-h-[48px] items-center justify-center" data-vk-one-tap />
      {state === "loading" && (
        <div className="h-[48px] w-full animate-pulse rounded-full bg-night-line" />
      )}
      {error && (
        <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}