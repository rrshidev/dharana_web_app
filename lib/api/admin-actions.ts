import { cookies } from "next/headers";
import { API_URL, API_PREFIX } from "@/lib/constants";
import { AUTH_COOKIE } from "./media";
import { apiFetch, ApiError } from "./server";

/**
 * Мутации админки. Route-handlers проксируют запросы на backend с bearer-токеном
 * из httpOnly-куки (dharana_token). JSON-операции — через apiFetch (Content-Type
 * application/json), multipart — через raw fetch (boundary формирует fetch сам).
 */

async function authToken(): Promise<string | null> {
  return (await cookies()).get(AUTH_COOKIE)?.value ?? null;
}

/**
 * Проверка is_admin на стороне Next (в дополнение к проверке бэкенда).
 * Раньше хватало любой валидной куки: страницы админки проверяли is_admin,
 * а route-handlers — нет, поэтому не-админ мог дёргать /api/admin/* напрямую.
 */
async function requireAdmin(): Promise<string> {
  const token = await authToken();
  if (!token) throw new ApiError(401, "unauthorized");
  const res = await fetch(`${API_URL}${API_PREFIX}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError(res.status === 401 ? 401 : 403, "forbidden");
  const me = (await res.json().catch(() => null)) as { is_admin?: boolean } | null;
  if (!me?.is_admin) throw new ApiError(403, "forbidden");
  return token;
}

export async function jsonAdmin<T = unknown>(
  path: string,
  body: unknown,
  method: "POST" | "PUT" | "DELETE" = "POST",
): Promise<T> {
  await requireAdmin();
  return apiFetch<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
}

/** Проксирует уже готовую FormData (загрузки файлов) на upstream. */
export async function forwardForm<T = unknown>(
  path: string,
  form: FormData,
  method: "POST" | "PUT" = "POST",
): Promise<T> {
  const token = await requireAdmin();
  if (!token) throw new ApiError(401, "unauthorized");
  const res = await fetch(`${API_URL}${API_PREFIX}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { detail?: string };
  if (!res.ok) {
    throw new ApiError(res.status, typeof data.detail === "string" ? data.detail : "server_error");
  }
  return data as T;
}

/** Превращает JSON-поля в multipart (endpoint'ы, принимающие Form(...)). */
export async function formAdmin<T = unknown>(
  path: string,
  fields: Record<string, string>,
  method: "POST" | "PUT" = "POST",
): Promise<T> {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) form.append(key, value);
  }
  return forwardForm<T>(path, form, method);
}

// ---- Операции с пользователями ----

export async function setUserPremiumAction(
  userId: number,
  body: { is_premium: boolean; days: number },
) {
  return jsonAdmin(`/admin/users/${userId}/premium`, body);
}

export async function setUserBanAction(userId: number, banned: boolean) {
  return jsonAdmin(`/admin/users/${userId}/ban`, { banned });
}

export async function setUserDeletedAction(userId: number, deleted: boolean) {
  return jsonAdmin(`/admin/users/${userId}/delete`, { deleted });
}

export async function sendUserMessageAction(
  userId: number,
  body: { channel: string; message: string; media_url?: string | null },
) {
  return jsonAdmin(`/admin/users/${userId}/message`, body);
}

// ---- Платежи ----

export async function reviewPaymentAction(
  paymentId: number,
  body: { status: "confirmed" | "rejected"; premium_days: number },
) {
  return jsonAdmin(`/admin/payments/${paymentId}/review`, body);
}

// ---- Рассылки ----

export interface BroadcastPayload {
  message: string;
  audience: { free: boolean; premium: boolean };
  channels: { telegram: boolean; app: boolean };
}

export async function createBroadcastAction(body: BroadcastPayload) {
  return jsonAdmin("/admin/broadcast", body);
}

export async function broadcastTestAction(body: BroadcastPayload) {
  return jsonAdmin("/admin/broadcast/test", body);
}

// ---- Асаны ----

export async function createAsanaAction(body: { name: string; category_id: string; description: string }) {
  return formAdmin("/admin/asanas", {
    name: body.name,
    category_id: body.category_id,
    description: body.description,
  });
}

export async function updateAsanaInfoAction(name: string, description: string) {
  return formAdmin(`/admin/asanas/${encodeURIComponent(name)}/info`, { description }, "PUT");
}

export async function deleteAsanaAction(name: string) {
  return jsonAdmin(`/admin/asanas/${encodeURIComponent(name)}`, undefined, "DELETE");
}

// ---- Комплексы ----

export async function updateSequenceAction(
  videoId: number,
  body: { name: string; section: "free" | "premium" },
) {
  return formAdmin(`/admin/sequences/${videoId}`, { name: body.name, section: body.section }, "PUT");
}

export async function deleteSequenceAction(videoId: number) {
  return jsonAdmin(`/admin/sequences/${videoId}`, undefined, "DELETE");
}