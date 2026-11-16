import { NextRequest, NextResponse } from "next/server";
import { API_PREFIX, API_URL } from "@/lib/constants";
import { AUTH_COOKIE } from "@/lib/api/media";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ session: string }> };

/**
 * Поллинг сессии MAX. Когда мини-приложение подтвердило вход, бэкенд один раз
 * отдаёт JWT — здесь же кладём его в httpOnly-куку, как при входе через Telegram.
 */
export async function GET(req: NextRequest, { params }: Props) {
  const { session } = await params;
  const id = (session ?? "").trim();
  if (!/^[a-f0-9]{16,64}$/i.test(id)) {
    return NextResponse.json({ ok: false, status: "expired" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(
      `${API_URL}${API_PREFIX}/auth/max/session/${encodeURIComponent(id)}`,
      { cache: "no-store" },
    );
  } catch {
    return NextResponse.json({ ok: false, status: "error" }, { status: 502 });
  }

  const data = (await res.json().catch(() => ({}))) as {
    status?: string;
    access_token?: string;
    user?: unknown;
  };

  if (data.status === "confirmed" && data.access_token) {
    const response = NextResponse.json({
      ok: true,
      status: "confirmed",
      user: data.user,
    });
    response.cookies.set(AUTH_COOKIE, data.access_token, COOKIE_OPTIONS);
    return response;
  }

  return NextResponse.json(
    { ok: res.ok, status: data.status ?? "error" },
    { status: res.ok ? 200 : res.status },
  );
}
