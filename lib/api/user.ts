import { apiFetch } from "./server";

export interface ProfileData {
  id: number;
  email: string | null;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  telegram_id: number | null;
  is_admin: boolean;
  total_practice_minutes: number;
  total_practice_days: number;
  current_streak: number;
  longest_streak: number;
  last_practice_at: string | null;
  created_at: string | null;
}

export interface PracticeStats {
  total_minutes: number;
  total_days: number;
  total_sessions: number;
  total_asanas_practiced: number;
  current_streak: number;
}

export interface SubscriptionStatus {
  is_premium: boolean;
  subscription_type?: string | null;
  subscription_end?: string | null;
  subscription_status?: string | null;
  is_trial?: boolean;
}

export interface PaymentRequisite {
  bank: string;
  card: string;
  card_number?: string;
  number?: string;
  holder?: string | null;
}

export interface FavoriteItem {
  id: number;
  asana_name: string;
  created_at: string;
}

export async function getProfile(): Promise<ProfileData> {
  return apiFetch<ProfileData>("/profile");
}

export async function getPracticeStats(): Promise<PracticeStats> {
  return apiFetch<PracticeStats>("/practice/stats");
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  return apiFetch<SubscriptionStatus>("/subscription/status");
}

export async function getPaymentRequisites(): Promise<PaymentRequisite[]> {
  const data = await apiFetch<{ requisites: PaymentRequisite[] }>("/payments/requisites");
  return data.requisites ?? [];
}

/** Names of asanas in the current user's favorites. */
export async function getFavoriteNames(): Promise<string[]> {
  const items = await apiFetch<FavoriteItem[]>("/favorites");
  return items.map((f) => f.asana_name);
}

export async function checkFavorite(name: string): Promise<boolean> {
  const data = await apiFetch<{ is_favorite: boolean }>(
    `/favorites/check/${encodeURIComponent(name)}`,
  );
  return data.is_favorite;
}