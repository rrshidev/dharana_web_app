import { NextRequest, NextResponse } from "next/server";
import { API_URL, API_PREFIX } from "@/lib/constants";
import { AUTH_COOKIE } from "@/lib/api/media";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const up = await fetch(`${API_URL}${API_PREFIX}/payments/receipt`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    cache: "no-store",
  });

  const data = (await up.json().catch(() => ({}))) as { detail?: string };

  if (!up.ok) {
    const detail = typeof data.detail === "string" ? data.detail : "server_error";
    return NextResponse.json({ ok: false, error: detail }, { status: up.status });
  }
  return NextResponse.json({ ok: true, ...data });
}