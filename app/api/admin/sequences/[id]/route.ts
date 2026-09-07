import { NextResponse } from "next/server";
import { deleteSequenceAction, updateSequenceAction } from "@/lib/api/admin-actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Props) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  let body: { name?: string; section?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "fields_required" }, { status: 400 });
  }
  try {
    const res = await updateSequenceAction(id, {
      name: body.name.trim(),
      section: body.section === "premium" ? "premium" : "free",
    });
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  try {
    const res = await deleteSequenceAction(id);
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ error: "delete_failed" }, { status: 400 });
  }
}