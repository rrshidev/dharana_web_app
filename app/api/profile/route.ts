import { NextRequest, NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api/server";
import { AUTH_COOKIE } from "@/lib/api/media";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const cleanBody: Record<string, string | null> = {};
  for (const key of ["name", "username", "bio"] as const) {
    if (body[key] !== undefined) cleanBody[key] = typeof body[key] === "string" ? (body[key] as string).trim() : null;
  }

  try {
    await apiFetch<{ ok: boolean }>("/profile", { method: "PATCH", body: JSON.stringify(cleanBody) }, token);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401)
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    if (err instanceof ApiError && err.status === 400)
      return NextResponse.json({ ok: false, error: err.detail }, { status: 400 });
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 502 });
  }
}