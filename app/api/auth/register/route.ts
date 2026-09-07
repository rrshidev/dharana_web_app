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

export async function POST(req: NextRequest) {
  let body: { email: string; password: string; name: string };
  try {
    body = await req.json();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, detail: `body_parse_error: ${msg}` }, { status: 400 });
  }

  const res = await fetch(`${API_URL}${API_PREFIX}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = "auth.errorGeneric";
    try {
      const body = (await res.json()) as { detail?: unknown };
      if (typeof body.detail === "string" && body.detail) detail = body.detail;
    } catch {
      // no body — keep generic
    }
    return NextResponse.json({ ok: false, detail }, { status: res.status });
  }

  const data = (await res.json()) as { access_token: string; user: unknown };

  const response = NextResponse.json({ ok: true, user: data.user });
  response.cookies.set(AUTH_COOKIE, data.access_token, COOKIE_OPTIONS);
  return response;
}