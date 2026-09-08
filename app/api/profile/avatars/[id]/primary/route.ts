import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api/server";
import { AUTH_COOKIE } from "@/lib/api/media";
import { profileAvatarSetPrimary } from "@/lib/api/profile-actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Props) {
  const token = req.cookies.get(AUTH_COOKIE)?.value ?? null;
  if (!token) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const avatarId = Number(id);
  if (!Number.isInteger(avatarId) || avatarId <= 0) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  try {
    await profileAvatarSetPrimary(token, avatarId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401)
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 502 });
  }
}