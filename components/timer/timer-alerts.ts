let audioCtx: AudioContext | null = null;

interface CtorWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as CtorWindow).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

function bell(freq: number, duration: number, volume: number, delay = 0): void {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export function unlockAudio(): void {
  getCtx();
}

export function playNudge(): void {
  bell(1046, 0.16, 0.16);
}

export function playGong(): void {
  bell(392, 1.5, 0.32);
  bell(587, 1.2, 0.2, 0.03);
  bell(784, 1.0, 0.1, 0.06);
}

export async function requestNotificationPermission(): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  try {
    if (Notification.permission === "default") await Notification.requestPermission();
  } catch {
    // ignore
  }
}

export function notify(title: string, body?: string): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, body ? { body } : undefined);
  } catch {
    // ignore
  }
}

export function isTabHidden(): boolean {
  return typeof document !== "undefined" ? document.hidden : false;
}

export function vibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}