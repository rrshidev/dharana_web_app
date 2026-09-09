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
  let body: { id_token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, detail: "auth.googleFailed" },
      { status: 400 },
    );
  }

  const idToken = typeof body.id_token === "string" ? body.id_token.trim() : "";
  if (!idToken) {
    return NextResponse.json(
      { ok: false, detail: "auth.googleFailed" },
      { status: 400 },
    );
  }

  const res = await fetch(`${API_URL}${API_PREFIX}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = "auth.googleFailed";
    try {
      const data = await res.json();
      if (typeof data.detail === "string") detail = data.detail;
    } catch {
      // ignore
    }
    if (detail === "INVALID_GOOGLE_TOKEN") detail = "auth.googleFailed";
    if (detail === "GOOGLE_NOT_CONFIGURED") detail = "auth.googleNotConfigured";
    return NextResponse.json({ ok: false, detail }, { status: res.status });
  }

  const data = (await res.json()) as { access_token: string; user: unknown };
  const response = NextResponse.json({ ok: true, user: data.user });
  response.cookies.set(AUTH_COOKIE, data.access_token, COOKIE_OPTIONS);
  return response;
}