import { NextResponse } from "next/server";
import { updateAsanaInfoAction } from "@/lib/api/admin-actions";
import { normalizePathParam } from "@/lib/api/catalog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ name: string }> };

export async function PUT(req: Request, { params }: Props) {
  const raw = (await params).name;
  const name = normalizePathParam(raw);
  if (!name) return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  let body: { description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  try {
    const res = await updateAsanaInfoAction(name, body.description?.trim() || "—");
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 400 });
  }
}