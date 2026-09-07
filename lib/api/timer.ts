import { apiFetch } from "./server";

export interface PracticeAsanaStep {
  name: string;
  duration_seconds: number;
  rest_seconds: number;
  image_url?: string | null;
}

export interface SequenceVideo {
  id: number;
  name: string;
  is_premium: boolean;
  accessible: boolean;
  video_url: string | null;
}

export interface StartedSession {
  id: number;
  status: string;
  started_at: string;
}

export interface ActiveSession {
  active: boolean;
  id?: number;
  started_at?: string | null;
  asanas_practiced?: string[];
}

export interface CompletedSession {
  ok: boolean;
  total_duration_seconds: number;
  asanas_count: number;
}

export async function getActiveSession(): Promise<ActiveSession> {
  return apiFetch<ActiveSession>("/practice/active");
}

export async function cancelPractice(sessionId: number): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/practice/${sessionId}`, { method: "DELETE" });
}

export async function startPractice(sequenceId?: number): Promise<StartedSession> {
  return apiFetch<StartedSession>("/practice/start", {
    method: "POST",
    body: JSON.stringify(sequenceId ? { sequence_id: sequenceId } : {}),
  });
}

export async function completePractice(
  sessionId: number,
  body: {
    asanas_practiced: string[];
    asana_durations: Record<string, number>;
    rest_seconds: number;
  },
): Promise<CompletedSession> {
  return apiFetch<CompletedSession>(`/practice/${sessionId}/complete`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function getSequenceVideos(): Promise<SequenceVideo[]> {
  return apiFetch<SequenceVideo[]>("/videos/sequences");
}