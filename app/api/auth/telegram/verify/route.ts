import { NextRequest, NextResponse } from "next/server";
import { API_URL, API_PREFIX } from "@/lib/constants";
import { AUTH_COOKIE } from "@/lib/api/media";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { code: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, detail: "auth.errorTelegramInvalid" },
      { status: 400 },
    );
  }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code) {
    return NextResponse.json(
      { ok: false, detail: "auth.errorTelegramInvalid" },
      { status: 400 },
    );
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value ?? null;

  const res = await fetch(`${API_URL}${API_PREFIX}/auth/telegram/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ code }),
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = "auth.errorTelegramInvalid";
    try {
      const data = await res.json();
      if (typeof data.detail === "string" && data.detail.toLowerCase().includes("expired")) {
        detail = "auth.errorTelegramExpired";
      }
    } catch {
      // ignore
    }
    return NextResponse.json({ ok: false, detail }, { status: res.status });
  }

  const data = (await res.json()) as { access_token: string; user: unknown };
  const response = NextResponse.json({ ok: true, user: data.user });
  response.cookies.set(AUTH_COOKIE, data.access_token, COOKIE_OPTIONS);
  return response;
}
