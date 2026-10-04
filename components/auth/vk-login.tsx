"use client";

import { useEffect, useState } from "react";
import { SocialButton } from "@/components/brand/social-button";
import { OAUTH_STATE_COOKIE, buildStateCookieValue } from "@/lib/auth/oauth";

/**
 * Вход через VK ID (`@vkid/sdk`, https://id.vk.ru) по полной авторизации.
 *
 * Почему не OneTap: виджет OneTap для гостя без активной сессии VK **вообще не рисует
 * кнопку** — VK отвечает `onetap: not authorized` (bridge-сообщение
 * `OneTapInternalEvents.NOT_AUTHORIZED`, проверено логом postMessage на проде), SDK
 * удаляет iframe, остаётся пустое место. OneTap — только «быстрый вход» для уже
 * авторизованных в VK, как единственная кнопка входа он непригоден.
 *
 * Схема: наша кнопка -> `VKID.Auth.login()` (mode `new_tab`, responseMode `callback`)
 * -> VK открывает страницу авторизации и возвращает payload (`code` + `device_id`)
 * postMessage'ом со своего origin'а (`isDomainAllowed` в SDK принимает только
 * `*.vk.com|*.vk.ru`, поэтому payload приходит именно от VK) ->
 * `VKID.Auth.exchangeCode(code, device_id)` (public client, без client_secret) ->
 * `access_token` -> `POST /api/auth/vk` -> JWT в httpOnly-куке.
 *
 * Фолбэки (2026-10-04, после жалоб на Chrome):
 *   * SDK грузится с unpkg, а если он не ответил — с jsDelivr; кнопка НЕ блокируется
 *     наглухо при неудачной загрузке (клик догружает SDK сам);
 *   * если браузер запретил popup (`cannot_create_new_tab`), переключаемся на
 *     `mode: 'redirect'` + `responseMode: 'redirect'` — тогда VK возвращает payload
 *     в наш `/api/auth/vk/callback`, который завершает вход на клиенте.
 */

const SDK_URLS = [
  "https://unpkg.com/@vkid/sdk@%3C3.0.0/dist-sdk/umd/index.js",
  "https://cdn.jsdelivr.net/npm/@vkid/sdk@2/dist-sdk/umd/index.js",
];

interface VkAuthPayload {
  code?: string;
  device_id?: string;
  state?: string;
}

interface VkIdSdk {
  Config: {
    init: (opts: Record<string, unknown>) => unknown;
    update: (opts: Record<string, unknown>) => unknown;
  };
  Languages: Record<string, number>;
  Auth: {
    login: (params?: { lang?: number; scheme?: string }) => Promise<VkAuthPayload>;
    exchangeCode: (code: string, deviceId: string) => Promise<{ access_token?: string }>;
  };
}

declare global {
  interface Window {
    // UMD-бандл @vkid/sdk 2.6.8 кладёт глобал в `VKIDSDK` (не `VKID`).
    VKIDSDK?: VkIdSdk;
    VKID?: VkIdSdk;
  }
}

function getSdk(): VkIdSdk | undefined {
  const sdk = window.VKIDSDK ?? window.VKID;
  return sdk?.Auth ? sdk : undefined;
}

function loadFrom(url: string): Promise<VkIdSdk> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => {
      const sdk = getSdk();
      if (sdk) resolve(sdk);
      else reject(new Error("vk_sdk_namespace"));
    };
    script.onerror = () => reject(new Error(`vk_sdk_load:${url}`));
    document.head.appendChild(script);
  });
}

let sdkPromise: Promise<VkIdSdk> | null = null;

/** Последовательно пробуем CDN'ы; уже загруженный SDK отдаём сразу. */
function ensureSdk(): Promise<VkIdSdk> {
  const ready = getSdk();
  if (ready) return Promise.resolve(ready);
  if (!sdkPromise) {
    sdkPromise = (async () => {
      let lastError: unknown;
      for (const url of SDK_URLS) {
        if (getSdk()) return getSdk() as VkIdSdk;
        try {
          return await loadFrom(url);
        } catch (e) {
          lastError = e;
        }
      }
      sdkPromise = null;
      throw lastError ?? new Error("vk_sdk_load");
    })();
  }
  return sdkPromise;
}

function isPopupBlocked(e: unknown): boolean {
  const code = (e as { code?: string })?.code ?? "";
  const text = String((e as { error?: string })?.error ?? "") + String((e as Error)?.message ?? "");
  return /cannot_create_new_tab|new_tab|Cannot create new tab/i.test(`${code} ${text}`);
}

export function VkLogin({
  locale,
  clientId,
  redirectUrl,
  label,
  errorLabel,
  nextUrl,
}: {
  locale: string;
  clientId: string;
  /** Должен совпадать с redirect URI, зарегистрированным в приложении VK ID. */
  redirectUrl: string;
  label: string;
  errorLabel: string;
  nextUrl?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    // Прогреваем SDK заранее: `Auth.login()` открывает вкладку синхронным
    // `window.open`, и любое ожидание перед ним срезает popup.
    ensureSdk()
      .then((sdk) => {
        sdk.Config.init({
          app: Number(clientId),
          redirectUrl,
          responseMode: "callback",
          mode: "new_tab",
          // LOWCODE не принимает scope/redirectUrl, поэтому передаём их только здесь.
          source: "LOWCODE",
          scope: "",
        });
      })
      .catch((e) => console.warn("[vk-login] sdk preload failed", e));
  }, [clientId, redirectUrl]);

  const finish = async (payload: VkAuthPayload) => {
    const sdk = getSdk();
    const code = payload?.code;
    const deviceId = payload?.device_id;
    if (!sdk) throw new Error("vk_sdk_namespace");
    if (!code || !deviceId) throw new Error("vk_auth_payload");

    const token = await sdk.Auth.exchangeCode(code, deviceId);
    const accessToken = token?.access_token;
    if (!accessToken) throw new Error("vk_access_token");

    const res = await fetch("/api/auth/vk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: accessToken }),
    });
    if (!res.ok) throw new Error(`vk_api_${res.status}`);
  };

  // Вызывается только из обработчика клика.
  const start = async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const sdk = await ensureSdk();
      // locale/next нужны серверному callback-route в фолбэке с редиректом.
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${OAUTH_STATE_COOKIE}=${buildStateCookieValue(
        crypto.randomUUID(),
        locale,
        nextUrl,
      )}; Path=/; Max-Age=600; SameSite=Lax${secure}`;

      let payload: VkAuthPayload;
      try {
        payload = await sdk.Auth.login({ lang: sdk.Languages?.RUS, scheme: "light" });
      } catch (e) {
        if (!isPopupBlocked(e)) throw e;
        // Popup запрещён настройками браузера — уходим на полную перезагрузку
        // страницы: payload вернётся в /api/auth/vk/callback, вход завершит он.
        sdk.Config.update({ mode: "redirect", responseMode: "redirect" });
        await sdk.Auth.login({ lang: sdk.Languages?.RUS, scheme: "light" });
        return;
      }

      await finish(payload);
      window.location.assign(nextUrl || `/${locale}/catalog`);
    } catch (e) {
      // Типовые причины: пользователь закрыл вкладку (`new_tab_has_been_closed`),
      // отказ/ошибка VK, недоступность SDK, 401 от бэкенда.
      console.warn("[vk-login] auth failed", e);
      setError(errorLabel);
      setPending(false);
    }
  };

  if (!clientId) return null;

  return (
    <div className="mx-auto w-full max-w-sm">
      <SocialButton network="vk" width="full" onClick={start} disabled={pending}>
        {label}
      </SocialButton>
      {error && (
        <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}