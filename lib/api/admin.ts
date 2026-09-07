import { apiFetch } from "./server";

export interface AdminStats {
  total_users: number;
  premium_users: number;
  conversion_rate: number;
  total_sessions: number;
  total_practice_minutes: number;
  new_users_week: number;
  new_users_month: number;
  sessions_week: number;
  sessions_month: number;
}

export interface AdminSeries {
  days: string[];
  new_users: number[];
  practices: number[];
  new_premium: number[];
}

export interface AdminMetrics {
  active_users: { dau: number; wau: number; mau: number; sessions_today: number };
  api: unknown;
}

export interface AdminUserRow {
  id: number;
  name: string | null;
  email: string | null;
  username: string | null;
  telegram_id: number | null;
  is_premium: boolean;
  is_banned: boolean;
  is_deleted: boolean;
  total_practice_minutes: number;
  total_practice_days: number;
  last_practice_at: string | null;
  created_at: string | null;
}

export interface AdminUserList {
  total: number;
  items: AdminUserRow[];
  limit: number;
  offset: number;
}

export interface AdminUserDetail {
  user: {
    id: number;
    name: string | null;
    email: string | null;
    username: string | null;
    telegram_id: number | null;
    avatar_url: string | null;
    bio: string | null;
    is_admin: boolean;
    is_banned: boolean;
    is_deleted: boolean;
    total_practice_minutes: number;
    total_practice_days: number;
    current_streak: number;
    longest_streak: number;
    last_practice_at: string | null;
    created_at: string | null;
  };
  subscription: {
    is_premium: boolean;
    subscription_type: string | null;
    subscription_status: string | null;
    subscription_end: string | null;
  };
  recent_sessions: Array<{
    id: number;
    asanas_practiced: string[];
    total_duration_seconds: number;
    started_at: string | null;
    completed_at: string | null;
  }>;
}

export interface AdminUserActivity {
  days: string[];
  minutes: number[];
  sessions: number[];
}

export interface AdminPayment {
  id: number;
  user_id: number | null;
  telegram_id: number | null;
  user_name: string | null;
  contact: string | null;
  source: string | null;
  payment_method: string | null;
  amount: number | null;
  receipt_url: string | null;
  status: string;
  premium_days: number | null;
  created_at: string | null;
}

export interface AdminActivityEvent {
  type: "new_user" | "practice";
  user_name?: string | null;
  user_id?: number | null;
  asanas_count?: number;
  duration_seconds?: number;
  timestamp: string | null;
}

export interface AdminSequence {
  id: number;
  name: string;
  is_premium: boolean;
  filename: string;
  filepath: string;
  video_url: string;
  created_at: string | null;
}

export interface AdminAsana {
  name: string;
  category_id: string;
  image_url: string | null;
  difficulty: number;
  effects: string[];
  has_video: boolean;
}

export function getAdminStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>("/admin/stats");
}

export function getAdminStatsSeries(days: number): Promise<AdminSeries> {
  return apiFetch<AdminSeries>(`/admin/stats/series?days=${days}`);
}

export function getAdminMetrics(): Promise<AdminMetrics> {
  return apiFetch<AdminMetrics>("/admin/metrics");
}

export function getAdminActivity(limit = 20): Promise<AdminActivityEvent[]> {
  return apiFetch<AdminActivityEvent[]>(`/admin/activity?limit=${limit}`);
}

export function getAdminUsers(
  search?: string,
  limit = 100,
): Promise<AdminUserList> {
  const q = new URLSearchParams({ limit: String(limit) });
  if (search && search.trim()) q.set("search", search.trim());
  return apiFetch<AdminUserList>(`/admin/users?${q.toString()}`);
}

export function getAdminUserDetail(userId: number): Promise<AdminUserDetail> {
  return apiFetch<AdminUserDetail>(`/admin/users/${userId}`);
}

export function getAdminUserActivity(
  userId: number,
  days: number,
): Promise<AdminUserActivity> {
  return apiFetch<AdminUserActivity>(`/admin/users/${userId}/activity?days=${days}`);
}

export function getAdminPayments(status?: string): Promise<{ payments: AdminPayment[] }> {
  const q = status && status !== "all" ? `?status=${status}` : "";
  return apiFetch<{ payments: AdminPayment[] }>(`/admin/payments${q}`);
}

export function getAdminSequences(): Promise<{ items: AdminSequence[] }> {
  return apiFetch<{ items: AdminSequence[] }>("/admin/sequences");
}

export function getAdminAsanas(): Promise<{ items: AdminAsana[] }> {
  return apiFetch<{ items: AdminAsana[] }>("/admin/asanas");
}