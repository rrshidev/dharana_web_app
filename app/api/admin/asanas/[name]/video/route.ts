import { NextRequest, NextResponse } from "next/server";
import { forwardForm } from "@/lib/api/admin-actions";
import { actionErrorResponse } from "@/lib/api/route-errors";
import { normalizePathParam } from "@/lib/api/catalog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ name: string }> };

export async function POST(req: NextRequest, { params }: Props) {
  const raw = (await params).name;
  const name = normalizePathParam(raw);
  if (!name) return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  const form = await req.formData();
  try {
    const res = await forwardForm(`/admin/asanas/${encodeURIComponent(name)}/video`, form);
    return NextResponse.json(res);
  } catch (e) {
    return actionErrorResponse(e, "upload_failed");
  }
}