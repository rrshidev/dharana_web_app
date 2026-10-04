import { NextRequest, NextResponse } from "next/server";
import { OAUTH_STATE_COOKIE, parseStateCookieValue } from "@/lib/auth/oauth";

export const dynamic = "force-dynamic";

/**
 * Callback-route VK ID: зарегистрированный в приложении redirect URI, и он же
 * fallback на случай, если VK всё же редиректнет браузер сюда (отказ пользователя,
 * `error=access_denied`).
 *
 * Основной флоу (VKLogin: `responseMode: callback` + `mode: new_tab`) payload с
 * `code`/`device_id` НЕ приходит сюда — его VK отдаёт postMessage'ом со своего
 * origin'а, а обмен кода делает клиент через `VKID.Auth.exchangeCode`. Поэтому
 * здесь нет server-side обмена `code`: он требует `device_id`, который без
 * postMessage-этапа недоступен (классический `oauth.vk.ru/access_token` для VK ID
 * отвечает `invalid_grant`).
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const { locale, nextUrl } = parseStateCookieValue(
    req.cookies.get(OAUTH_STATE_COOKIE)?.value ?? "",
  );
  const safeLocale = locale === "en" ? "en" : "ru";
  const vkError = params.get("error") ?? "";

  const url = new URL(`/${safeLocale}/login`, req.nextUrl.origin);
  url.searchParams.set(
    "error",
    vkError === "access_denied" || vkError === "oauth_access_denied"
      ? "oauth_denied"
      : "oauth_failed",
  );
  if (nextUrl && nextUrl.startsWith(`/${safeLocale}/`)) url.searchParams.set("next", nextUrl);

  const res = NextResponse.redirect(url, 303);
  res.cookies.delete(OAUTH_STATE_COOKIE);
  return res;
}