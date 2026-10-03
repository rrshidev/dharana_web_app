import { NextRequest } from "next/server";
import { handleOAuthCallback } from "@/lib/auth/oauth-callback";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleOAuthCallback(req, "vk");
}