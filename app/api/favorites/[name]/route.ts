import { NextRequest, NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api/server";
import { AUTH_COOKIE } from "@/lib/api/media";
import { normalizePathParam } from "@/lib/api/catalog";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ name: string }> };

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { name } = await ctx.params;
  const token = _req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return unauthorized();
  try {
    const data = await apiFetch<{ is_favorite: boolean }>(
      `/favorites/check/${encodeURIComponent(normalizePathParam(name))}`,
      {},
      token,
    );
    return NextResponse.json({ ok: true, is_favorite: data.is_favorite });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return unauthorized();
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 502 });
  }
}

export async function POST(_req: NextRequest, ctx: Ctx) {
  const { name } = await ctx.params;
  const token = _req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return unauthorized();
  try {
    await apiFetch<{ id: number }>(
      `/favorites/${encodeURIComponent(normalizePathParam(name))}`,
      { method: "POST" },
      token,
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return unauthorized();
    if (err instanceof ApiError && err.status === 400) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 502 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { name } = await ctx.params;
  const token = _req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return unauthorized();
  try {
    await apiFetch<{ ok: boolean }>(
      `/favorites/${encodeURIComponent(normalizePathParam(name))}`,
      { method: "DELETE" },
      token,
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return unauthorized();
    if (err instanceof ApiError && err.status === 404) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 502 });
  }
}