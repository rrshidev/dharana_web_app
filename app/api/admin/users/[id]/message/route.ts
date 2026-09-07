import { NextResponse } from "next/server";
import { sendUserMessageAction } from "@/lib/api/admin-actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Props) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "invalid_user_id" }, { status: 400 });
  }
  let body: { channel?: string; message?: string; media_url?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!body.message?.trim()) {
    return NextResponse.json({ error: "message_required" }, { status: 400 });
  }
  try {
    const res = await sendUserMessageAction(userId, {
      channel: (body.channel || "both").toLowerCase(),
      message: body.message.trim(),
      media_url: body.media_url || null,
    });
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ error: "send_failed" }, { status: 400 });
  }
}