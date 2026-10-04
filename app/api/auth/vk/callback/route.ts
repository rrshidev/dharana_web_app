import { NextRequest, NextResponse } from "next/server";
import { OAUTH_STATE_COOKIE, parseStateCookieValue } from "@/lib/auth/oauth";
import { SITE_URL, VK_CLIENT_ID } from "@/lib/constants";

export const dynamic = "force-dynamic";

const SDK_URL = "https://unpkg.com/@vkid/sdk@%3C3.0.0/dist-sdk/umd/index.js";

/**
 * Зарегистрированный в VK ID redirect URI. Две роли:
 *
 * 1. Фолбэк без popup. Если браузер запретил новую вкладку, клиент переключает SDK
 *    на `mode: 'redirect'` + `responseMode: 'redirect'`, и VK возвращает payload
 *    (`code`, `device_id`, `state`) query-параметрами сюда. Обмен кода делает
 *    клиентская страница ниже: она читает `code_verifier`/`state` из кук SDK
 *    (`vkid_sdk:*`, SameSite=Strict — но они доступны JS на нашем же origin) и
 *    повторяет `VKID.Auth.exchangeCode`. Такой обмен возможен только с `device_id`,
 *    который без VK-этапа недоступен: классический `oauth.vk.ru/access_token` для
 *    VK ID отвечает `invalid_grant`.
 * 2. Отказ пользователя (`error=access_denied`) — редирект на `/login` с ошибкой.
 *
 * Основной путь (popup, `responseMode: callback`) сюда не заходит: payload приходит
 * postMessage'ом со страницы VK, и обмен выполняется на странице логина.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const { locale, nextUrl } = parseStateCookieValue(
    req.cookies.get(OAUTH_STATE_COOKIE)?.value ?? "",
  );
  const safeLocale = locale === "en" ? "en" : "ru";
  const code = params.get("code") ?? "";
  const deviceId = params.get("device_id") ?? "";
  const vkError = params.get("error") ?? "";

  const fail = (kind: "oauth_denied" | "oauth_failed") => {
    // Location относительный: в standalone req.nextUrl.origin даёт
    // http://0.0.0.0:3000 (внутренний хост), абсолютный Location увёл бы гостя туда.
    const search = new URLSearchParams({ error: kind });
    if (nextUrl && nextUrl.startsWith(`/${safeLocale}/`)) search.set("next", nextUrl);
    const res = new NextResponse(null, {
      status: 303,
      headers: { Location: `/${safeLocale}/login?${search.toString()}` },
    });
    res.cookies.delete(OAUTH_STATE_COOKIE);
    return res;
  };

  if (!code || !deviceId) {
    const denied = vkError === "access_denied" || vkError === "oauth_access_denied";
    return fail(denied ? "oauth_denied" : "oauth_failed");
  }

  const redirectUrl = `${SITE_URL}/api/auth/vk/callback`;
  const target = nextUrl && nextUrl.startsWith(`/${safeLocale}/`) ? nextUrl : `/${safeLocale}/catalog`;
  const cfg = JSON.stringify({
    clientId: VK_CLIENT_ID,
    redirectUrl,
    code,
    deviceId,
    target,
    loginUrl: `/${safeLocale}/login?error=oauth_failed`,
    sdkUrl: SDK_URL,
  });

  const html = `<!doctype html>
<html lang="${safeLocale}">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<title>Dharana</title>
<style>body{background:#0b0b0f;color:#9ca3af;font:15px/1.5 system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}</style>
</head>
<body><p id="s">${"Вход через VK"}</p>
<script src="${SDK_URL}"></script>
<script>
(function () {
  var cfg = ${cfg};
  var status = document.getElementById("s");
  function fail(e) {
    console.error("[vk-callback]", e);
    location.replace(cfg.loginUrl);
  }
  function load() {
    if (window.VKIDSDK || window.VKID) return Promise.resolve(window.VKIDSDK || window.VKID);
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = cfg.sdkUrl;
      s.async = true;
      s.onload = function () { resolve(window.VKIDSDK || window.VKID); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  load().then(function (sdk) {
    if (!sdk) throw new Error("vk_sdk_namespace");
    sdk.Config.init({
      app: Number(cfg.clientId),
      redirectUrl: cfg.redirectUrl,
      responseMode: "callback",
      source: "LOWCODE",
      scope: "",
    });
    return sdk.Auth.exchangeCode(cfg.code, cfg.deviceId);
  }).then(function (token) {
    if (!token || !token.access_token) throw new Error("vk_access_token");
    return fetch("/api/auth/vk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token.access_token }),
    }).then(function (res) {
      if (!res.ok) throw new Error("vk_api_" + res.status);
    });
  }).then(function () {
    location.replace(cfg.target);
  }).catch(fail);
})();
</script>
</body>
</html>`;

  const res = new NextResponse(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
  res.cookies.delete(OAUTH_STATE_COOKIE);
  return res;
}