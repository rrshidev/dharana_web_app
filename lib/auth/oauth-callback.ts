import { NextRequest, NextResponse } from "next/server";
import { API_URL, API_PREFIX } from "@/lib/constants";
import { AUTH_COOKIE } from "@/lib/api/media";
import { OAUTH_STATE_COOKIE, parseStateCookieValue, type OAuthProvider } from "@/lib/auth/oauth";

/**
 * Общая часть колбэков OAuth-провайдеров с редиректом (VK ID, Яндекс).
 *
 * Провайдер возвращает браузер сюда с `code` и `state`. Мы сверяем state с
 * nonce из куки (double submit), обмениваем код на наш JWT (client_secret
 * остаётся на бэкенде) и ставим httpOnly-куку, после чего уводим юзера
 * обратно на сайт. Ошибки не показываем через JSON — редиректим на
 * /login?error=…, там страница рендерит перевод.
 */

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export const dynamic = "force-dynamic";

function redirectTo(req: NextRequest, target: string, dropStateCookie: boolean) {
  // Location относительный — иначе уходим на внутренний адрес контейнера
  // (в standalone req.url и nextUrl содержат http://0.0.0.0:3000/..., Caddy
  // снаружи отдаёт dharana.ru). Браузер сам разрезолвит путь относительно
  // текущей страницы, поэтому редирект всегда уходит на dharana.ru.
  const res = new NextResponse(null, {
    status: 303,
    headers: { Location: target },
  });
  if (dropStateCookie) res.cookies.delete(OAUTH_STATE_COOKIE);
  return res;
}

function loginRedirect(req: NextRequest, locale: string, code: string) {
  return redirectTo(req, `/${locale}/login?error=${code}`, true);
}

function successRedirect(req: NextRequest, locale: string, nextUrl: string) {
  const target = nextUrl && nextUrl.startsWith(`/${locale}/`) ? nextUrl : `/${locale}/catalog`;
  return redirectTo(req, target, true);
}

export async function handleOAuthCallback(req: NextRequest, provider: OAuthProvider) {
  const params = req.nextUrl.searchParams;
  const rawState = req.cookies.get(OAUTH_STATE_COOKIE)?.value ?? "";
  const { nonce, locale, nextUrl: encodedNext, codeVerifier } = parseStateCookieValue(rawState);
  const safeLocale = locale === "en" ? "en" : "ru";

  // Пользователь отказался на экране провайдера — возвращаем с понятной ошибкой.
  if (params.get("error")) {
    return loginRedirect(req, safeLocale, "oauth_denied");
  }

  const code = params.get("code") ?? "";
  const state = params.get("state") ?? "";
  if (!code || !nonce || !state || state !== nonce) {
    return loginRedirect(req, safeLocale, "oauth_invalid_state");
  }

  let nextUrl = "";
  try {
    nextUrl = decodeURIComponent(encodedNext);
  } catch {
    nextUrl = "";
  }

  const res = await fetch(`${API_URL}${API_PREFIX}/auth/${provider}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // code_verifier обязателен для VK ID (PKCE S256), Яндекс его игнорирует.
    body: JSON.stringify(codeVerifier ? { code, code_verifier: codeVerifier } : { code }),
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = ((await res.json()) as { detail?: string }).detail ?? "";
    } catch {
      // ignore
    }
    if (detail.endsWith("NOT_CONFIGURED")) {
      return loginRedirect(req, safeLocale, "oauth_not_configured");
    }
    return loginRedirect(req, safeLocale, "oauth_failed");
  }

  const data = (await res.json()) as { access_token: string };
  const redirect = successRedirect(req, safeLocale, nextUrl);
  redirect.cookies.set(AUTH_COOKIE, data.access_token, COOKIE_OPTIONS);
  return redirect;
}