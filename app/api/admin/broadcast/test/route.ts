import { NextResponse } from "next/server";
import { broadcastTestAction } from "@/lib/api/admin-actions";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  try {
    const res = await broadcastTestAction(body as Parameters<typeof broadcastTestAction>[0]);
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ error: "test_failed" }, { status: 400 });
  }
}