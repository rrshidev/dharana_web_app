"use client";

import { useEffect, useState } from "react";
import { SocialButton } from "@/components/brand/social-button";
import { OAUTH_STATE_COOKIE, buildStateCookieValue } from "@/lib/auth/oauth";

/**
 * Вход через VK ID (`@vkid/sdk`, https://id.vk.ru) по полной авторизации.
 *
 * Почему не OneTap: виджет OneTap (`OneTapInternalEvents.NOT_AUTHORIZED`, проверено
 * postMessage-логом на проде) для гостя без активной сессии VK **вообще не рисует
 * кнопку** — VK отвечает `onetap: not authorized`, SDK удаляет iframe, остаётся пустое
 * место. OneTap годится только для «быстрого входа» тех, кто уже авторизован в VK,
 * поэтому как единственная кнопка входа он непригоден.
 *
 * Что делаем вместо: наша кнопка -> `VKID.Auth.login()` (mode `new_tab`,
 * responseMode `callback`) -> VK открывает страницу авторизации в новой вкладке и
 * возвращает payload (`code` + `device_id`) postMessage'ом со своего origin'а
 * (`isDomainAllowed` в SDK принимает только `*.vk.com|*.vk.ru`, поэтому payload
 * приходит именно от VK, а наш callback-route в этом флоу не грузится) ->
 * `VKID.Auth.exchangeCode(code, device_id)` (public client, без client_secret) ->
 * `access_token` -> `POST /api/auth/vk` -> JWT в httpOnly-куке.
 *
 * SDK по-прежнему генерирует `code_verifier`/`state` в своих куках
 * (`vkid_sdk:*`, SameSite=Strict, домен `.dharana.ru`) и сам подставляет их в
 * authorize и в обмен кода, поэтому серверный обмен `code` без `device_id`
 * (классический `oauth.vk.ru/access_token` -> invalid_grant) больше не нужен.
 */

const SDK_URL = "https://unpkg.com/@vkid/sdk@%3C3.0.0/dist-sdk/umd/index.js";

interface VkAuthPayload {
  code?: string;
  device_id?: string;
  state?: string;
}

interface VkIdSdk {
  Config: { init: (opts: Record<string, unknown>) => unknown };
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
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    loadVkScript()
      .then((sdk) => {
        if (cancelled) return;
        sdk.Config.init({
          app: Number(clientId),
          redirectUrl,
          // `callback` + `new_tab`: payload приходит postMessage'ом в текущую вкладку.
          responseMode: "callback",
          mode: "new_tab",
          // LOWCODE не принимает scope/redirectUrl, поэтому передаём их только здесь.
          source: "LOWCODE",
          scope: "",
        });
        setReady(true);
      })
      .catch((e) => {
        console.warn("[vk-login] sdk load failed", e);
        if (!cancelled) setReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, redirectUrl]);

  // Вызывается только из обработчика клика: `Auth.login()` открывает новую вкладку
  // синхронным `window.open`, любой await до него срезает всплывающие окна.
  const start = async () => {
    const sdk = getSdk();
    if (!sdk || pending) return;
    setPending(true);
    setError(null);
    try {
      // locale/next на случай, если VK всё же редиректнет на наш callback-route
      // (например, при отказе) — по ним вернём гостя на нужную страницу логина.
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${OAUTH_STATE_COOKIE}=${buildStateCookieValue(
        crypto.randomUUID(),
        locale,
        nextUrl,
      )}; Path=/; Max-Age=600; SameSite=Lax${secure}`;

      const payload = await sdk.Auth.login({ lang: sdk.Languages?.RUS, scheme: "light" });
      const code = payload?.code;
      const deviceId = payload?.device_id;
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

      window.location.assign(nextUrl || `/${locale}/catalog`);
    } catch (e) {
      // Типовые причины: пользователь закрыл вкладку (`new_tab_has_been_closed`),
      // popup заблокирован (`cannot_create_new_tab`), отказ/ошибка VK.
      console.warn("[vk-login] auth failed", e);
      setError(errorLabel);
      setPending(false);
    }
  };

  if (!clientId) return null;

  return (
    <div className="mx-auto w-full max-w-sm">
      <SocialButton network="vk" width="full" onClick={start} disabled={!ready || pending}>
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