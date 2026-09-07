import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE } from "./media";

/**
 * Redirects guests to /login?next=<target>. Must be awaited inside a
 * force-dynamic server component before rendering protected content.
 * `next` should be a RAW target path (unencoded) — encoding happens here once.
 */
export async function requireAuth(locale: string, next: string): Promise<void> {
  const cookieStore = await cookies();
  if (!cookieStore.get(AUTH_COOKIE)?.value) {
    const safeNext = next.startsWith(`/${locale}/`) || next === `/${locale}` ? next : `/${locale}/catalog`;
    redirect(`/${locale}/login?next=${encodeURIComponent(safeNext)}`);
  }
}