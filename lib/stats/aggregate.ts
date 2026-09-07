export interface PracticeHistoryRow {
  started_at?: string | null;
  completed_at?: string | null;
  total_duration_seconds: number;
  asanas_practiced?: string[] | null;
}

export interface DayActivity {
  label: string;
  minutes: number;
  sessions: number;
  asanas: number;
}

/** День (YYYY-MM-DD) из ISO-даты по частям строки — без сдвига таймзоны. */
function isoDay(iso: string): string | null {
  if (iso.length < 10) return null;
  return iso.slice(0, 10);
}

/**
 * Агрегирует сессии по дням за последние rangeDays дней (включая сегодня),
 * как делает ActivityChart в приложении.
 */
export function aggregateActivity(
  sessions: PracticeHistoryRow[],
  rangeDays: number,
): DayActivity[] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - (rangeDays - 1));

  const days = new Map<string, DayActivity>();
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = isoDay(d.toISOString()) ?? String(i);
    days.set(key, { label: key, minutes: 0, sessions: 0, asanas: 0 });
  }

  for (const s of sessions) {
    const ts = s.started_at ?? s.completed_at;
    if (!ts) continue;
    const key = isoDay(ts);
    if (!key || !days.has(key)) continue;
    const day = days.get(key)!;
    day.minutes += s.total_duration_seconds / 60;
    day.sessions += 1;
    day.asanas += s.asanas_practiced?.length ?? 0;
  }

  return [...days.values()];
}