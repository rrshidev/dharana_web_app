import { NextRequest, NextResponse } from "next/server";
import { API_PREFIX, API_URL } from "@/lib/constants";
import { AUTH_COOKIE } from "@/lib/api/media";

export const dynamic = "force-dynamic";

/**
 * Создать сессию входа через MAX.
 *
 * Дальше клиент открывает deep_link из ответа (мини-приложение в MAX) и
 * поллит /api/auth/max/session/<id>. Если пользователь уже авторизован,
 * сессия работает как привязка MAX к профилю — поэтому куку передаём дальше.
 */
export async function POST(req: NextRequest) {
  const contentType = (req.headers.get("content-type") ?? "").toLowerCase();
  if (!contentType.startsWith("application/json")) {
    return NextResponse.json({ ok: false, detail: "max_failed" }, { status: 415 });
  }

  let body: { consent?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, detail: "max_failed" }, { status: 400 });
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value ?? null;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${API_PREFIX}/auth/max/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ consent: body.consent !== false }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ ok: false, detail: "max_failed" }, { status: 502 });
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const detail = data.detail === "MAX_NOT_CONFIGURED" ? "max_not_configured" : "max_failed";
    return NextResponse.json({ ok: false, detail }, { status: res.status });
  }

  return NextResponse.json({ ok: true, ...data });
}
