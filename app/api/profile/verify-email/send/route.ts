import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api/server";
import { profileVerifyEmailResend } from "@/lib/api/profile-actions";
import { AUTH_COOKIE } from "@/lib/api/media";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value ?? null;

  try {
    const data = await profileVerifyEmailResend(token);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.detail }, { status: err.status });
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}