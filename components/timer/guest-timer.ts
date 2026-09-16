const KEY = "dharana_guest_practices";

/**
 * Guest timer gate: how many practices this device completed without an
 * account. Purely client-side (localStorage) — the conversion funnel
 * (1 free practice, then mandatory sign-in) never touches the API.
 */
export function getGuestPractices(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(KEY);
    const n = Number.parseInt(raw ?? "0", 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function addGuestPractice(): number {
  const next = getGuestPractices() + 1;
  try {
    window.localStorage.setItem(KEY, String(next));
  } catch {
    // private mode / quota — keep counting in memory
  }
  return next;
}