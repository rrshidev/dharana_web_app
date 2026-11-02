import { NextRequest, NextResponse } from "next/server";
import { forwardForm } from "@/lib/api/admin-actions";
import { actionErrorResponse } from "@/lib/api/route-errors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  try {
    const res = await forwardForm("/admin/sequences/video", form);
    return NextResponse.json(res);
  } catch (e) {
    return actionErrorResponse(e, "upload_failed");
  }
}