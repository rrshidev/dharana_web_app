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

/** Кука хранит nonce, локаль и запрошенный переход: `nonce:locale:next`. */
export function buildStateCookieValue(nonce: string, locale: string, nextUrl?: string) {
  return `${nonce}:${locale}:${encodeURIComponent(nextUrl ?? "")}`;
}