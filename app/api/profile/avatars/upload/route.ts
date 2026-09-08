import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api/server";
import { AUTH_COOKIE } from "@/lib/api/media";
import { profileAvatarUpload } from "@/lib/api/profile-actions";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value ?? null;
  if (!token) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ ok: false, error: "no_file" }, { status: 400 });
  }

  const out = new FormData();
  out.append("file", file);

  try {
    const avatar = await profileAvatarUpload(token, out);
    return NextResponse.json({ ok: true, ...avatar });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401)
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    if (e instanceof ApiError && e.detail === "Maximum 5 avatars allowed")
      return NextResponse.json({ ok: false, error: "avatar_limit" }, { status: 400 });
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 502 });
  }
}