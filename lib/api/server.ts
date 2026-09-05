import { cookies } from "next/headers";
import { API_URL, API_PREFIX } from "@/lib/constants";
import { AUTH_COOKIE } from "./media";

export interface ApiUser {
  id: number;
  email: string | null;
  name: string | null;
  username?: string | null;
  avatar_url?: string | null;
}

/**
 * Server-side fetch helper: attaches the JWT bearer token from the
 * dharana_token cookie to every outgoing request to the backend API.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const cookieStore = await cookies();
  const authToken = token ?? cookieStore.get(AUTH_COOKIE)?.value;

  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (authToken) headers.set("Authorization", `Bearer ${authToken}`);

  const res = await fetch(`${API_URL}${API_PREFIX}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = "unknown_error";
    try {
      const data = await res.json();
      if (typeof data.detail === "string") detail = data.detail;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, detail);
  }

  return (await res.json()) as T;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
  }
}