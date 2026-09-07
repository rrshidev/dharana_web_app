import { NextResponse } from "next/server";
import { reviewPaymentAction } from "@/lib/api/admin-actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Props) {
  const { id } = await params;
  const paymentId = Number(id);
  if (!Number.isInteger(paymentId) || paymentId <= 0) {
    return NextResponse.json({ error: "invalid_payment_id" }, { status: 400 });
  }
  let body: { status?: string; premium_days?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (body.status !== "confirmed" && body.status !== "rejected") {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }
  try {
    const res = await reviewPaymentAction(paymentId, {
      status: body.status,
      premium_days: Number(body.premium_days) || 30,
    });
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ error: "review_failed" }, { status: 400 });
  }
}