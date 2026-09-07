import { NextResponse } from "next/server";
import { getActiveSession } from "@/lib/api/timer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getActiveSession();
    return NextResponse.json(session);
  } catch {
    return NextResponse.json({ active: false }, { status: 200 });
  }
}
