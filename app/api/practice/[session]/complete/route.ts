import { NextResponse } from "next/server";
import { completePractice } from "@/lib/api/timer";

export const dynamic = "force-dynamic";

type Params = Promise<{ session: string }>;

export async function PUT(req: Request, { params }: { params: Params }) {
  const { session } = await params;
  const sessionId = Number(session);
  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return NextResponse.json({ error: "bad_params" }, { status: 400 });
  }

  let body: {
    asanas_practiced?: string[];
    asana_durations?: Record<string, number>;
    rest_seconds?: number;
  } = {};
  try {
    body = await req.json();
  } catch {
    // fall through with defaults
  }

  try {
    const result = await completePractice(sessionId, {
      asanas_practiced: body.asanas_practiced ?? [],
      asana_durations: body.asana_durations ?? {},
      rest_seconds: body.rest_seconds ?? 15,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "complete_failed" }, { status: 400 });
  }
}