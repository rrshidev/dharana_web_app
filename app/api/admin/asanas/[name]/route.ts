import { NextResponse } from "next/server";
import { deleteAsanaAction } from "@/lib/api/admin-actions";
import { actionErrorResponse } from "@/lib/api/route-errors";
import { normalizePathParam } from "@/lib/api/catalog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ name: string }> };

export async function DELETE(_req: Request, { params }: Props) {
  const raw = (await params).name;
  const name = normalizePathParam(raw);
  if (!name) return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  try {
    const res = await deleteAsanaAction(name);
    return NextResponse.json(res);
  } catch (e) {
    return actionErrorResponse(e, "delete_failed");
  }
}