import { NextRequest, NextResponse } from "next/server";
import { forwardForm, requireAdmin } from "@/lib/api/admin-actions";
import { actionErrorResponse } from "@/lib/api/route-errors";
import { normalizePathParam } from "@/lib/api/catalog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ name: string }> };

export async function POST(req: NextRequest, { params }: Props) {
  // Проверяем права ДО чтения тела: иначе анонимный клиент может заставить
  // Next парсить произвольно большой multipart (DoS).
  try {
    await requireAdmin();
  } catch (e) {
    return actionErrorResponse(e, "unauthorized");
  }

  const raw = (await params).name;
  const name = normalizePathParam(raw);
  if (!name) return NextResponse.json({ error: "invalid_name" }, { status: 400 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  try {
    const res = await forwardForm(`/admin/asanas/${encodeURIComponent(name)}/photo`, form);
    return NextResponse.json(res);
  } catch (e) {
    return actionErrorResponse(e, "upload_failed");
  }
}