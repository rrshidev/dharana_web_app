import { API_URL, API_PREFIX } from "@/lib/constants";
import { ApiError } from "./server";

/**
 * Мутации аватаров профиля. Route-handlers проксируют запросы на backend
 * с bearer-токеном из httpOnly-куки (dharana_token).
 */

function tokenBearer(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseDetail(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: string };
    if (typeof data.detail === "string") return data.detail;
  } catch {
    // ignore
  }
  return "server_error";
}

async function profileFormFetch<T>(
  path: string,
  token: string | null,
  form: FormData,
): Promise<T> {
  if (!token) throw new ApiError(401, "unauthorized");
  const res = await fetch(`${API_URL}${API_PREFIX}${path}`, {
    method: "POST",
    headers: tokenBearer(token),
    body: form,
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError(res.status, await parseDetail(res));
  return (await res.json()) as T;
}

async function profileJsonFetch<T>(
  path: string,
  token: string | null,
  method: "DELETE" | "PUT",
): Promise<T> {
  if (!token) throw new ApiError(401, "unauthorized");
  const res = await fetch(`${API_URL}${API_PREFIX}${path}`, {
    method,
    headers: tokenBearer(token),
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError(res.status, await parseDetail(res));
  return (await res.json()) as T;
}

export async function profileAvatarUpload(
  token: string | null,
  form: FormData,
): Promise<{ id: number; url: string; is_primary: boolean }> {
  return profileFormFetch("/profile/avatars/upload", token, form);
}

export async function profileAvatarDelete(token: string | null, avatarId: number): Promise<{ ok: boolean }> {
  return profileJsonFetch(`/profile/avatars/${avatarId}`, token, "DELETE");
}

export async function profileAvatarSetPrimary(
  token: string | null,
  avatarId: number,
): Promise<{ ok: boolean }> {
  return profileJsonFetch(`/profile/avatars/${avatarId}/primary`, token, "PUT");
}