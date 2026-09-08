import { NextResponse } from "next/server";
import { setUserDeletedAction } from "@/lib/api/admin-actions";
import { ApiError } from "@/lib/api/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Props) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "invalid_user_id" }, { status: 400 });
  }
  let body: { deleted?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  try {
    const res = await setUserDeletedAction(userId, Boolean(body.deleted));
    return NextResponse.json(res);
  } catch (e) {
    const detail = e instanceof ApiError ? e.detail : "";
    return NextResponse.json(
      { error: detail === "Cannot delete an admin user" ? "admin_protected" : "action_failed" },
      { status: e instanceof ApiError ? e.status : 400 },
    );
  }
}