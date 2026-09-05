import { NextRequest, NextResponse } from "next/server";
import { apiFetch, ApiError, type ApiUser } from "@/lib/api/server";
import { AUTH_COOKIE } from "@/lib/api/media";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;

  const response = NextResponse.json({ user: null });
  if (!token) return response;

  try {
    const user = await apiFetch<ApiUser>("/auth/me", {}, token);
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      response.cookies.set(AUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    }
    return response;
  }
}