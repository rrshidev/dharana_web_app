import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE } from "./media";
import { apiFetch, ApiError } from "./server";

/**
 * Redirects guests to /login?next=<target>. Must be awaited inside a
 * force-dynamic server component before rendering protected content.
 * `next` should be a RAW target path (unencoded) — encoding happens here once.
 *
 * Validates the JWT against the backend: guests with a missing, expired or
 * invalid cookie are redirected. On backend network errors the page fails
 * open (renders) so the site does not go down with the API.
 */
export async function requireAuth(locale: string, next: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) {
    redirectToLogin(locale, next);
    return;
  }

  try {
    await apiFetch<{ id: number }>("/auth/me", {}, token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirectToLogin(locale, next);
    }
    // network / 5xx: fail-open — render the page anyway
  }
}

function redirectToLogin(locale: string, next: string): never {
  const safeNext =
    next.startsWith(`/${locale}/`) || next === `/${locale}` ? next : `/${locale}/catalog`;
  redirect(`/${locale}/login?next=${encodeURIComponent(safeNext)}`);
}