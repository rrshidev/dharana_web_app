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

const SDK_URL = "https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js";

interface VkIdSdk {
  Config: { init: (opts: Record<string, unknown>) => void };
  OneTap: {
    render: (opts?: Record<string, unknown>) => void;
    on: (event: string, handler: (payload: unknown) => void) => void;
    off?: (event: string, handler: (payload: unknown) => void) => void;
  };
  OneTapInternalEvents: Record<string, string>;
  Auth: {
    exchangeCode: (
      code: string,
      deviceId: string,
    ) => Promise<{ access_token?: string }>;
  };
}

declare global {
  interface Window {
    VKID?: VkIdSdk;
  }
}

export interface VkOneTapLabels {
  failed: string;
}

function loadVkScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.VKID?.OneTap) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SDK_URL}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("vk_sdk_load")));
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("vk_sdk_load"));
    document.head.appendChild(script);
  });
}

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
  const [ready, setReady] = useState(false);
  const nextRef = useRef(nextUrl);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    const onSuccess = async (payload: unknown) => {
      const data = (payload ?? {}) as { code?: string; device_id?: string };
      if (!data.code || !data.device_id) {
        setError(labels.failed);
        return;
      }
      setError(null);
      try {
        // Обмен кода на токен — на стороне VK, client_secret не участвует.
        const token = await window.VKID!.Auth.exchangeCode(data.code, data.device_id);
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
        window.location.assign(nextRef.current || `/${locale}/catalog`);
      } catch {
        if (!cancelled) setError(labels.failed);
      }
    };
    const onDenied = () => setError(labels.failed);

    loadVkScript()
      .then(() => {
        if (cancelled || !window.VKID?.OneTap) return;
        const sdk = window.VKID;
        sdk.Config.init({
          app: Number(clientId),
          redirectUrl,
          responseMode: "Callback",
          // LOWCODE — режим, который VK ID включает для обычных веб-страниц.
          source: "LOWCODE",
          scope: "",
        });
        const events = sdk.OneTapInternalEvents;
        sdk.OneTap.on(events.LOGIN_SUCCESS, onSuccess);
        if (events.NOT_AUTHORIZED) sdk.OneTap.on(events.NOT_AUTHORIZED, onDenied);
        sdk.OneTap.render();
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });

    return () => {
      cancelled = true;
      const sdk = window.VKID;
      if (sdk?.OneTap?.off) {
        try {
          sdk.OneTap.off(sdk.OneTapInternalEvents.LOGIN_SUCCESS, onSuccess);
          if (sdk.OneTapInternalEvents.NOT_AUTHORIZED) {
            sdk.OneTap.off(sdk.OneTapInternalEvents.NOT_AUTHORIZED, onDenied);
          }
        } catch {
          // ignore
        }
      }
    };
  }, [clientId, redirectUrl, labels, locale]);

  if (!clientId) return null;

  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Виджет сам рисует официальную кнопку VK (свой iframe) — контейнер
          центрирует её, пока она не появилась, чтобы блок не прыгал. */}
      <div className="flex min-h-[48px] items-center justify-center" data-vk-one-tap />
      {!ready && <div className="h-[48px] w-full animate-pulse rounded-full bg-night-line" />}
      {error && (
        <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}