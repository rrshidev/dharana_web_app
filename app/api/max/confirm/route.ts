import { NextRequest, NextResponse } from "next/server";
import { API_PREFIX, API_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * Подтверждение входа из мини-приложения MAX.
 *
 * Страница мини-приложения живёт на нашем домене и присылает сюда initData —
 * подпись проверяет бэкенд (ключ = токен бота, который есть только у нас).
 * JWT здесь не отдаём: его забирает исходный клиент поллингом сессии.
 */
export async function POST(req: NextRequest) {
  const contentType = (req.headers.get("content-type") ?? "").toLowerCase();
  if (!contentType.startsWith("application/json")) {
    return NextResponse.json({ ok: false, detail: "invalid" }, { status: 415 });
  }

  let body: { session_id?: string; init_data?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, detail: "invalid" }, { status: 400 });
  }

  const sessionId = typeof body.session_id === "string" ? body.session_id.trim() : "";
  const initData = typeof body.init_data === "string" ? body.init_data : "";
  if (!sessionId || !initData) {
    return NextResponse.json({ ok: false, detail: "invalid" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${API_PREFIX}/auth/max/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, init_data: initData }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ ok: false, detail: "failed" }, { status: 502 });
  }

  const data = (await res.json().catch(() => ({}))) as { detail?: string };
  if (!res.ok) {
    return NextResponse.json(
      { ok: false, detail: data.detail ?? "failed" },
      { status: res.status },
    );
  }

  return NextResponse.json({ ok: true, status: "confirmed" });
}
