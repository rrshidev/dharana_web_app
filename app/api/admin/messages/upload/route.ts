import { NextRequest, NextResponse } from "next/server";
import { forwardForm } from "@/lib/api/admin-actions";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  try {
    const res = await forwardForm("/admin/messages/upload", form);
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ error: "upload_failed" }, { status: 400 });
  }
}