"use client";

import { useState } from "react";
import { SocialButton } from "@/components/brand/social-button";
import type { SocialNetwork } from "@/components/brand/social-icon";

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
 */
export type OAuthProvider = "vk" | "yandex";

const PROVIDER_CONFIG: Record<
  OAuthProvider,
  { authorizeUrl: string; scope: string; callbackPath: string }
> = {
  vk: {
    authorizeUrl: "https://id.vk.com/oauth2/authorize",
    scope: "email",
    callbackPath: "/api/auth/vk/callback",
  },
  yandex: {
    authorizeUrl: "https://oauth.yandex.ru/authorize",
    scope: "login:email login:info",
    callbackPath: "/api/auth/yandex/callback",
  },
};

export const OAUTH_STATE_COOKIE = "dharana_oauth_state";

export function buildStateCookieValue(nonce: string, locale: string, nextUrl?: string) {
  return `${nonce}:${locale}:${encodeURIComponent(nextUrl ?? "")}`;
}

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

  const start = () => {
    try {
      const nonce = crypto.randomUUID();
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${OAUTH_STATE_COOKIE}=${buildStateCookieValue(
        nonce,
        locale,
        nextUrl,
      )}; Path=/; Max-Age=600; SameSite=Lax${secure}`;

      const config = PROVIDER_CONFIG[provider];
      const url = new URL(config.authorizeUrl);
      url.searchParams.set("client_id", clientId);
      url.searchParams.set("redirect_uri", `${window.location.origin}${config.callbackPath}`);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", config.scope);
      url.searchParams.set("state", nonce);
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