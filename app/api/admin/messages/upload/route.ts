import { NextRequest, NextResponse } from "next/server";
import { forwardForm, requireAdmin } from "@/lib/api/admin-actions";
import { actionErrorResponse } from "@/lib/api/route-errors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Проверяем права ДО чтения тела: иначе анонимный клиент может заставить
  // Next парсить произвольно большой multipart (DoS).
  try {
    await requireAdmin();
  } catch (e) {
    return actionErrorResponse(e, "unauthorized");
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  try {
    const res = await forwardForm("/admin/messages/upload", form);
    return NextResponse.json(res);
  } catch (e) {
    return actionErrorResponse(e, "upload_failed");
  }
}