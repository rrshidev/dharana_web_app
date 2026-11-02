import { NextResponse } from "next/server";
import { createBroadcastAction } from "@/lib/api/admin-actions";
import { actionErrorResponse } from "@/lib/api/route-errors";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  try {
    const res = await createBroadcastAction(body as Parameters<typeof createBroadcastAction>[0]);
    return NextResponse.json(res);
  } catch (e) {
    return actionErrorResponse(e, "broadcast_failed");
  }
}