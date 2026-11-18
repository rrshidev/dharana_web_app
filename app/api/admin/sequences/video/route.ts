import { NextRequest, NextResponse } from "next/server";
import { forwardStream, requireAdmin } from "@/lib/api/admin-actions";
import { actionErrorResponse } from "@/lib/api/route-errors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Проверяем права ДО чтения тела: иначе анонимный клиент может заставить
  // сервер принимать большой multipart (DoS).
  let token: string;
  try {
    token = await requireAdmin();
  } catch (e) {
    return actionErrorResponse(e, "unauthorized");
  }

  try {
    const res = await forwardStream("/admin/sequences/video", req, token);
    return NextResponse.json(res);
  } catch (e) {
    return actionErrorResponse(e, "upload_failed");
  }
}