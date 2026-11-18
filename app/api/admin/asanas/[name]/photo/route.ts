import { NextRequest, NextResponse } from "next/server";
import { forwardStream, requireAdmin } from "@/lib/api/admin-actions";
import { actionErrorResponse } from "@/lib/api/route-errors";
import { normalizePathParam } from "@/lib/api/catalog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ name: string }> };

export async function POST(req: NextRequest, { params }: Props) {
  // Проверяем права ДО чтения тела: иначе анонимный клиент может заставить
  // сервер принимать большой multipart (DoS).
  let token: string;
  try {
    token = await requireAdmin();
  } catch (e) {
    return actionErrorResponse(e, "unauthorized");
  }

  const raw = (await params).name;
  const name = normalizePathParam(raw);
  if (!name) return NextResponse.json({ error: "invalid_name" }, { status: 400 });

  try {
    const res = await forwardStream(
      `/admin/asanas/${encodeURIComponent(name)}/photo`,
      req,
      token,
    );
    return NextResponse.json(res);
  } catch (e) {
    return actionErrorResponse(e, "upload_failed");
  }
}