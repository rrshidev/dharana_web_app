import { NextResponse } from "next/server";
import { cancelPractice } from "@/lib/api/timer";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ session: string }> };

export async function DELETE(_req: Request, { params }: Props) {
  const { session } = await params;
  const id = Number(session);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid_session" }, { status: 400 });
  }
  try {
    const res = await cancelPractice(id);
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ error: "cancel_failed" }, { status: 400 });
  }
}
