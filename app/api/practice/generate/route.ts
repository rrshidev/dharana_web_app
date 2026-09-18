import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL, API_PREFIX } from "@/lib/constants";
import { AUTH_COOKIE } from "@/lib/api/media";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { difficulty?: string; duration_minutes?: number; focus?: string } = {};
  try {
    body = await req.json();
  } catch {
    // invalid body — backend will 422
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  const res = await fetch(`${API_URL}${API_PREFIX}/practice/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (res.status === 403) {
    let detail: Record<string, unknown> = {};
    try {
      const data = await res.json();
      if (typeof data.detail === "object" && data.detail) detail = data.detail;
    } catch {
      // ignore
    }
    return NextResponse.json({
      error: "generation_limit",
      is_premium: Boolean(detail.is_premium),
      can_generate: detail.can_generate !== false,
    }, { status: 403 });
  }

  if (!res.ok) {
    return NextResponse.json({ error: "generate_failed" }, { status: 400 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}