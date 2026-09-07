"use client";

import { useEffect, useRef, useState } from "react";
import type { PracticeAsanaStep } from "@/lib/api/timer";

export type TimerMode = "idle" | "asana" | "rest" | "compensation" | "paused";

export interface TimerScreenLabels {
  title: string;
  ready: string;
  modeAsana: string;
  modeRest: string;
  modeCompensation: string;
  modePaused: string;
  start: string;
  reset: string;
  pause: string;
  resume: string;
  next: string;
  stop: string;
  completeTitle: string;
  completeCount: string;
  completeDuration: string;
  again: string;
  close: string;
  indexOf: string;
}

interface Summary {
  count: number;
  durationSeconds: number;
}

interface Props {
  asanas: PracticeAsanaStep[];
  startSessionId: number;
  labels: TimerScreenLabels;
  onExit: () => void;
  onRestart: () => void;
}

function fmtTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function fmtDuration(total: number): string {
  const m = Math.floor(total / 60);
  return m > 0 ? `${m} мин` : `${total} с`;
}

export function TimerScreen({
  asanas,
  startSessionId,
  labels,
  onExit,
  onRestart,
}: Props) {
  const [mode, setMode] = useState<TimerMode>("idle");
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);
  const stateRef = useRef({ mode, running, paused, currentIndex, remaining, total, completed, durations });
  stateRef.current = { mode, running, paused, currentIndex, remaining, total, completed, durations };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const beginPhase = (nextMode: TimerMode, seconds: number) => {
    stopTimer();
    setMode(nextMode);
    setRemaining(seconds);
    setTotal(seconds);
    setRunning(true);
    setPaused(false);
    lastTickRef.current = Date.now();
    timerRef.current = setInterval(tick, 250);
  };

  const tick = () => {
    const st = stateRef.current;
    if (!st.running || st.paused) return;
    const now = Date.now();
    const elapsed = Math.floor((now - lastTickRef.current) / 1000);
    if (elapsed < 1) return;
    lastTickRef.current = now;

    let nextRemaining = st.remaining - elapsed;
    if (nextRemaining < 0) nextRemaining = 0;
    setRemaining(nextRemaining);

    if (nextRemaining <= 0) {
      stopTimer();
      handlePhaseComplete();
    }
  };

  const handlePhaseComplete = () => {
    const st = stateRef.current;
    if (st.mode === "asana") {
      const step = asanas[st.currentIndex];
      if (!step) return;
      const newCompleted = [...st.completed, step.name];
      const newDurations = {
        ...st.durations,
        [step.name]: (st.durations[step.name] ?? 0) + step.duration_seconds,
      };
      setCompleted(newCompleted);
      setDurations(newDurations);

      if (st.currentIndex < asanas.length - 1) {
        const rest = asanas[st.currentIndex].rest_seconds;
        beginPhase("rest", rest);
      } else {
        beginPhase("compensation", 10);
      }
    } else if (st.mode === "rest") {
      const next = asanas[st.currentIndex + 1];
      if (next) beginPhase("asana", next.duration_seconds);
    } else if (st.mode === "compensation") {
      stopTimer();
      setRunning(false);
      setMode("idle");
      void saveAndSummarize(st.completed, st.durations);
    }
  };

  const saveAndSummarize = async (
    asanasPracticed: string[],
    asanaDurations: Record<string, number>,
  ) => {
    const restSeconds = asanas[0]?.rest_seconds ?? 15;
    const totalSeconds = Object.values(asanaDurations).reduce((a, b) => a + b, 0);
    setSaving(true);
    setError(false);
    try {
      const res = await fetch(`/api/practice/${startSessionId}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asanas_practiced: asanasPracticed,
          asana_durations: asanaDurations,
          rest_seconds: restSeconds,
        }),
      });
      if (!res.ok) setError(true);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
      setSummary({
        count: asanasPracticed.length,
        durationSeconds: totalSeconds,
      });
    }
  };

  const handleStart = () => {
    if (asanas.length === 0) return;
    setCurrentIndex(0);
    setCompleted([]);
    setDurations({});
    setSummary(null);
    beginPhase("asana", asanas[0].duration_seconds);
  };

  const handlePause = () => {
    stopTimer();
    setPaused(true);
    setMode("paused");
  };

  const handleResume = () => {
    beginPhase(stateRef.current.mode === "rest" ? "rest" : "asana", stateRef.current.remaining);
  };

  const handleReset = () => {
    stopTimer();
    setMode("idle");
    setRunning(false);
    setPaused(false);
    setCurrentIndex(0);
    setRemaining(0);
    setTotal(0);
    setCompleted([]);
    setDurations({});
  };

  const handleSkip = () => {
    const st = stateRef.current;
    if (!st.running || st.paused) return;
    stopTimer();
    handlePhaseComplete();
  };

  const handleStop = () => {
    stopTimer();
    setMode("idle");
    setRunning(false);
    setPaused(false);
    const st = stateRef.current;
    if (st.completed.length > 0) {
      void saveAndSummarize(st.completed, st.durations);
    }
  };

  useEffect(() => stopTimer, []);

  const modeLabel =
    mode === "asana"
      ? labels.modeAsana
      : mode === "rest"
        ? labels.modeRest
        : mode === "compensation"
          ? labels.modeCompensation
          : mode === "paused"
            ? labels.modePaused
            : labels.ready;

const strokeClass =
  mode === "asana" ? "text-accent" : mode === "rest" ? "text-emerald-400" : mode === "compensation" ? "text-indigo-400" : "text-muted";

  const progress = total > 0 ? (total - remaining) / total : 0;
  const circumference = 2 * Math.PI * 90;

  const currentName = asanas[currentIndex]?.name ?? "";

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-8">
      <h1 className="text-center text-lg font-semibold">{labels.title}</h1>

      {summary ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
            </svg>
          </span>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight">{labels.completeTitle}</h2>
          <p className="mt-2 text-sm text-muted">
            {labels.completeCount.replace("{count}", String(summary.count))} ·{" "}
            {labels.completeDuration.replace("{duration}", fmtDuration(summary.durationSeconds))}
          </p>
          {error && <p className="mt-3 text-sm text-rose-400">Saving failed</p>}
          <div className="mt-8 flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                onRestart();
              }}
              className="h-12 w-full rounded-full bg-accent text-sm font-semibold text-night transition-opacity hover:opacity-90"
            >
              {labels.again}
            </button>
            <button
              type="button"
              onClick={onExit}
              className="h-12 w-full rounded-full border border-night-line text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {labels.close}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 flex justify-center">
            <div className="relative h-56 w-56">
              <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
                <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="8" className="text-night-line" />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  className={strokeClass}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className={`text-6xl font-extralight tabular-nums ${strokeClass}`}>{fmtTime(remaining)}</p>
                <p className={`mt-1 text-sm ${strokeClass}`}>{modeLabel}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-2xl font-semibold tracking-tight">{currentName}</p>
            <p className="mt-1 text-sm text-muted">
              {labels.indexOf.replace("{current}", String(currentIndex + 1)).replace("{total}", String(asanas.length))}
            </p>
          </div>

          <div className="mt-8 flex justify-center gap-6">
            {running && !paused && (
              <button
                type="button"
                onClick={handleStop}
                className="flex flex-col items-center gap-1.5 text-muted transition-colors hover:text-ink"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-night-line bg-night-soft/40">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
                    <rect x="7" y="7" width="10" height="10" rx="1.5" />
                  </svg>
                </span>
                <span className="text-[11px]">{labels.stop}</span>
              </button>
            )}
            <button
              type="button"
              onClick={running ? (paused ? handleResume : handlePause) : handleStart}
              className="flex flex-col items-center gap-1.5 text-muted transition-colors hover:text-ink"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-night">
                {running ? (
                  paused ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8" aria-hidden>
                      <rect x="6" y="5" width="4" height="14" rx="1" />
                      <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                  )
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </span>
              <span className="text-[11px]">{running ? (paused ? labels.resume : labels.pause) : labels.start}</span>
            </button>
            {running && !paused && (
              <button
                type="button"
                onClick={handleSkip}
                className="flex flex-col items-center gap-1.5 text-muted transition-colors hover:text-ink"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-night-line bg-night-soft/40">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
                    <path d="M6 5v14l9-7zM16 5h2v14h-2z" />
                  </svg>
                </span>
                <span className="text-[11px]">{labels.next}</span>
              </button>
            )}
          </div>

          <div className="mt-8 flex max-h-64 flex-col gap-1.5 overflow-y-auto">
            {asanas.map((step, index) => {
              const isCompleted = completed.includes(step.name);
              const isCurrent =
                index === currentIndex && (mode === "asana" || mode === "paused");
              return (
                <div
                  key={`${index}-${step.name}`}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 ${
                    isCurrent
                      ? "border-accent/50 bg-accent/10"
                      : isCompleted
                        ? "border-emerald-400/30 bg-emerald-400/5"
                        : "border-night-line bg-night/60"
                  }`}
                >
                  <span
                    className={`text-lg ${
                      isCompleted
                        ? "text-emerald-400"
                        : isCurrent
                          ? "text-accent"
                          : "text-muted/50"
                    }`}
                  >
                    {isCompleted ? "✓" : isCurrent ? "▶" : "○"}
                  </span>
                  <span
                    className={`flex-1 text-sm ${
                      isCompleted
                        ? "text-emerald-400"
                        : isCurrent
                          ? "font-semibold text-ink"
                          : "text-muted"
                    }`}
                  >
                    {step.name}
                  </span>
                  <span className="text-[11px] tabular-nums text-muted">{step.duration_seconds} с</span>
                </div>
              );
            })}
          </div>
          {saving && <p className="mt-4 text-center text-xs text-muted">…</p>}
        </>
      )}
    </div>
  );
}