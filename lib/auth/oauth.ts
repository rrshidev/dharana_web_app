/**
 * Общие константы OAuth-редиректа для VK ID и Яндекса.
 *
 * Модуль намеренно БЕЗ "use client": его импортируют и клиентский компонент
 * кнопки, и серверные route-handlers колбэков. Если объявить константу в
 * клиентском модуле и заимпортировать на сервер, значение превращается в
 * client-reference (прокси) — `req.cookies.get(...)` начинает возвращать
 * undefined, и проверка state падает с «ссылка устарела» (реальный баг 2026-10-04).
 */

export const OAUTH_STATE_COOKIE = "dharana_oauth_state";

export type OAuthProvider = "vk" | "yandex";

export const OAUTH_PROVIDERS: Record<
  OAuthProvider,
  { authorizeUrl: string; scope: string; callbackPath: string; pkce: boolean }
> = {
  vk: {
    // VK ID живёт в зоне .ru, путь /oauth2/authorize больше не существует (404).
    authorizeUrl: "https://id.vk.ru/authorize",
    scope: "email",
    callbackPath: "/api/auth/vk/callback",
    // VK ID требует PKCE: без code_challenge отдаёт
    // "code_challenge or code_challenge_method is invalid".
    pkce: true,
  },
  yandex: {
    authorizeUrl: "https://oauth.yandex.ru/authorize",
    scope: "login:email login:info",
    callbackPath: "/api/auth/yandex/callback",
    pkce: false,
  },
};

/** Кука хранит nonce, локаль, запрошенный переход и PKCE-verifier: `nonce:locale:next:verifier`. */
export function buildStateCookieValue(
  nonce: string,
  locale: string,
  nextUrl?: string,
  codeVerifier = ""
) {
  return `${nonce}:${locale}:${encodeURIComponent(nextUrl ?? "")}:${codeVerifier}`;
}

export type OAuthStateCookie = {
  nonce: string;
  locale: string;
  nextUrl: string;
  codeVerifier: string;
};

/** Разбор куки состояния; tolerates старый формат без verifier (3 поля). */
export function parseStateCookieValue(raw: string): OAuthStateCookie {
  const [nonce = "", locale = "ru", encodedNext = "", codeVerifier = ""] = raw.split(":");
  return { nonce, locale, nextUrl: encodedNext, codeVerifier };
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Случайный PKCE-verifier (RFC 7636, 43–128 символов). Только в браузере. */
export function randomCodeVerifier(): string {
  const bytes = new Uint8Array(48);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

/** code_challenge = BASE64URL(SHA-256(verifier)). Только в браузере. */
export async function pkceChallengeFrom(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64Url(new Uint8Array(digest));
}