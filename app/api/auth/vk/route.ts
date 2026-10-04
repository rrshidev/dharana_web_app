import { NextRequest, NextResponse } from "next/server";
import { API_URL, API_PREFIX } from "@/lib/constants";
import { AUTH_COOKIE } from "@/lib/api/media";

/**
 * Вход по VK ID (полная авторизация, компонент components/auth/vk-login.tsx).
 *
 * Клиент сам меняет код на access_token через
 * `VKID.Auth.exchangeCode` — это публичный клиентский обмен (VK ID требует
 * device_id, который выдаёт только их SDK), поэтому client_secret не нужен и
 * секрет в браузер не попадает. Мы проверяем присланный токен на бэкенде
 * (`POST /auth/vk` → id.vk.ru/oauth2/user_info) и ставим httpOnly-куку.
 */

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { access_token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, detail: "auth.oauthFailed" }, { status: 400 });
  }

  const accessToken =
    typeof body.access_token === "string" ? body.access_token.trim() : "";
  if (!accessToken) {
    return NextResponse.json({ ok: false, detail: "auth.oauthFailed" }, { status: 400 });
  }

  const res = await fetch(`${API_URL}${API_PREFIX}/auth/vk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken }),
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = "auth.oauthFailed";
    try {
      const data = await res.json();
      if (typeof data.detail === "string") detail = data.detail;
    } catch {
      // ignore
    }
    if (detail === "VK_NOT_CONFIGURED") detail = "auth.oauthNotConfigured";
    return NextResponse.json({ ok: false, detail }, { status: res.status });
  }

  const data = (await res.json()) as { access_token: string; user: unknown };
  const response = NextResponse.json({ ok: true, user: data.user });
  response.cookies.set(AUTH_COOKIE, data.access_token, COOKIE_OPTIONS);
  return response;
}