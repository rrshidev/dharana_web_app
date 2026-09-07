import { apiFetch } from "./server";

export interface Category {
  id: string;
  display_name: string;
  description: string;
  asana_count: number;
}

export interface AsanaSummary {
  name: string;
  category_id: string;
  image_url: string | null;
  difficulty: number;
  effects: string[];
}

export interface AsanaDetail extends AsanaSummary {
  category_name: string;
  description: string;
  contraindications: string[];
}

export interface AsanaList {
  total: number;
  items: AsanaSummary[];
  limit: number;
  offset: number;
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories");
}

interface MaybeError {
  error?: string;
}

export async function getAsanas(params: {
  category?: string;
  difficulty?: number;
  effect?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<AsanaList> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.difficulty) qs.set("difficulty", String(params.difficulty));
  if (params.effect) qs.set("effect", params.effect);
  if (params.search) qs.set("search", params.search);
  qs.set("limit", String(params.limit ?? 24));
  qs.set("offset", String(params.offset ?? 0));
  const data = await apiFetch<AsanaList & MaybeError>(`/asanas?${qs.toString()}`);
  return data.error
    ? { total: 0, items: [], limit: params.limit ?? 24, offset: params.offset ?? 0 }
    : { total: data.total, items: data.items, limit: data.limit, offset: data.offset };
}

export async function getRandomAsana(): Promise<AsanaDetail | null> {
  const data = await apiFetch<AsanaDetail & MaybeError>("/asanas/random");
  return data.error ? null : data;
}

export async function getAsanaDetail(name: string): Promise<AsanaDetail | null> {
  const data = await apiFetch<AsanaDetail & MaybeError>(`/asanas/${encodeURIComponent(name)}`);
  return data.error ? null : data;
}

/**
 * Next может отдать динамический сегмент как URL-encoded (в прод-рантайме
 * NODE_ENV=production, standalone, params приходят в виде "%D0%92...").
 * Декодируем один раз: для обычного (декодированного) значения — no-op.
 */
export function normalizePathParam(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}