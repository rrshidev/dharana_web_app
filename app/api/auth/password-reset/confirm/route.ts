import { NextRequest, NextResponse } from "next/server";
import { API_URL, API_PREFIX } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, detail: "resetPassword.error" }, { status: 400 });
  }

  const res = await fetch(`${API_URL}${API_PREFIX}/auth/password-reset/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: typeof body.token === "string" ? body.token : "",
      password: typeof body.password === "string" ? body.password : "",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = "resetPassword.error";
    try {
      const data = await res.json();
      if (typeof data.detail === "string") {
        if (data.detail === "INVALID_RESET_TOKEN") detail = "resetPassword.invalid";
        if (data.detail === "PASSWORD_TOO_SHORT") detail = "resetPassword.passwordTooShort";
      }
    } catch {
      // ignore
    }
    return NextResponse.json({ ok: false, detail }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}