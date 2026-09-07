import { NextResponse } from "next/server";
import { startPractice } from "@/lib/api/timer";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let sequenceId: number | undefined;
  try {
    const body = await req.json();
    if (typeof body.sequence_id === "number") sequenceId = body.sequence_id;
  } catch {
    // empty body — start without a sequence
  }

  try {
    const session = await startPractice(sequenceId);
    return NextResponse.json(session);
  } catch {
    return NextResponse.json({ error: "start_failed" }, { status: 400 });
  }
}