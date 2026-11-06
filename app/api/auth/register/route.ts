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
  let body: {
    email: string;
    password: string;
    name: string;
    website?: string;
    consent?: boolean;
    consent_version?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, detail: "auth.errorGeneric" }, { status: 400 });
  }

  const res = await fetch(`${API_URL}${API_PREFIX}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    // Не пересказываем ответ бэкенда: он различает «email уже занят» и тем
    // самым позволяет перечислять аккаунты.
    return NextResponse.json(
      { ok: false, detail: "auth.errorGeneric" },
      { status: res.status },
    );
  }

  const data = (await res.json()) as { access_token: string; user: unknown };

  const response = NextResponse.json({ ok: true, user: data.user });
  response.cookies.set(AUTH_COOKIE, data.access_token, COOKIE_OPTIONS);
  return response;
}