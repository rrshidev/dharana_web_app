import { NextResponse } from "next/server";
import { createAsanaAction } from "@/lib/api/admin-actions";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { name?: string; category_id?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!body.name?.trim() || !body.category_id?.trim()) {
    return NextResponse.json({ error: "fields_required" }, { status: 400 });
  }
  try {
    const res = await createAsanaAction({
      name: body.name.trim(),
      category_id: body.category_id.trim(),
      description: body.description?.trim() || "—",
    });
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ error: "create_failed" }, { status: 400 });
  }
}