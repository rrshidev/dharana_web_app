import { NextRequest, NextResponse } from "next/server";
import { API_URL, API_PREFIX } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, detail: "resetPassword.sendFailed" }, { status: 400 });
  }

  const res = await fetch(`${API_URL}${API_PREFIX}/auth/password-reset/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: typeof body.email === "string" ? body.email : "" }),
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = "resetPassword.sendFailed";
    try {
      const data = await res.json();
      if (typeof data.detail === "string") {
        if (data.detail === "EMAIL_INVALID") detail = "resetPassword.emailInvalid";
        if (data.detail === "TOO_FREQUENT") detail = "resetPassword.frequency";
      }
    } catch {
      // ignore
    }
    return NextResponse.json({ ok: false, detail }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}