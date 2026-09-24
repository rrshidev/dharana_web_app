import { apiFetch } from "./server";

export interface TheoryItem {
  name: string;
  name_en: string | null;
  content: string;
  image_url: string | null;
}

export async function getBasics(lang?: string): Promise<TheoryItem[]> {
  const qs = lang ? `?lang=${encodeURIComponent(lang)}` : "";
  return apiFetch<TheoryItem[]>(`/basics${qs}`);
}

export async function getSteps(lang?: string): Promise<TheoryItem[]> {
  const qs = lang ? `?lang=${encodeURIComponent(lang)}` : "";
  return apiFetch<TheoryItem[]>(`/steps${qs}`);
}