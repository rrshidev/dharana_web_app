"use client";

import { useState } from "react";
import { SocialButton } from "@/components/brand/social-button";
import type { SocialNetwork } from "@/components/brand/social-icon";
import {
  buildStateCookieValue,
  OAUTH_PROVIDERS,
  OAUTH_STATE_COOKIE,
  pkceChallengeFrom,
  randomCodeVerifier,
  type OAuthProvider,
} from "@/lib/auth/oauth";

export type { OAuthProvider };

/**
 * Вход через провайдера с редиректом (VK ID, Яндекс) — в отличие от Google,
 * у этих нет JS-SDK, поэтому флоу обычный: клик → провайдер → колбэк
 * `/api/auth/vk/callback` или `/api/auth/yandex/callback`.
 *
 * Кнопка выглядит ровно так же, как остальные (SocialButton + контурный знак),
 * отличается только поведением.
 *
 * CSRF: перед уходом кладём nonce в куку dharana_oauth_state (double submit),
 * колбэк сверяет его с `state` из ответа провайдера. Провайдеры возвращают
 * пользователя top-level редиректом, поэтому SameSite=Lax куку пропускает.
 *
 * Константы OAuth живут в `lib/auth/oauth` — их импортирует и серверный
 * колбэк, а этот файл помечен "use client" (импорт отсюда на сервере ломает
 * чтение куки, см. lib/auth/oauth.ts).
 */

export function OAuthLogin({
  provider,
  network,
  clientId,
  label,
  errorLabel,
  locale,
  nextUrl,
}: {
  provider: OAuthProvider;
  /** Какой знак рисуем: у VK и MAX один и тот же вход, но иконки разные. */
  network: SocialNetwork;
  clientId: string;
  label: string;
  errorLabel: string;
  locale: string;
  nextUrl?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!clientId) return null;

  const start = async () => {
    try {
      const nonce = crypto.randomUUID();
      const config = OAUTH_PROVIDERS[provider];
      // PKCE (обязателен для VK ID): verifier хранится в куке состояния,
      // challenge уходит в authorize-запрос.
      const codeVerifier = config.pkce ? randomCodeVerifier() : "";
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${OAUTH_STATE_COOKIE}=${buildStateCookieValue(
        nonce,
        locale,
        nextUrl,
        codeVerifier,
      )}; Path=/; Max-Age=600; SameSite=Lax${secure}`;

      const url = new URL(config.authorizeUrl);
      url.searchParams.set("client_id", clientId);
      url.searchParams.set("redirect_uri", `${window.location.origin}${config.callbackPath}`);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", config.scope);
      url.searchParams.set("state", nonce);
      if (codeVerifier) {
        url.searchParams.set("code_challenge", await pkceChallengeFrom(codeVerifier));
        url.searchParams.set("code_challenge_method", "S256");
      }
      window.location.assign(url.toString());
    } catch {
      setFailed(true);
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm">
      <SocialButton network={network} width="full" onClick={start}>
        {label}
      </SocialButton>
      {failed && (
        <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
          {errorLabel}
        </p>
      )}
    </div>
  );
}