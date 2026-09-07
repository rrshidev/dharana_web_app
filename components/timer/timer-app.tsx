"use client";

import { useMemo, useState } from "react";
import { mediaUrl } from "@/lib/api/media";
import type { ActiveSession, PracticeAsanaStep } from "@/lib/api/timer";
import { TimerScreen, type TimerScreenLabels } from "./timer-screen";

export interface TimerAppLabels {
  title: string;
  defaultTime: string;
  asanaLabel: string;
  restLabel: string;
  selectedTitle: string;
  availableTitle: string;
  addHint: string;
  start: string;
  stopError: string;
  startError: string;
  moveUp: string;
  moveDown: string;
  remove: string;
  durationCombine: string;
  restCombine: string;
  resumeTitle: string;
  resumeText: string;
  resumeAction: string;
  resumeError: string;
  screen: TimerScreenLabels;
}

interface Props {
  asanas: Array<{
    name: string;
    image_url: string | null;
    categoryLabel: string;
  }>;
  activeSession?: ActiveSession | null;
  labels: TimerAppLabels;
}

const DURATION_OPTIONS = [5, 10, 15, 30, 45, 60, 90, 120, 180, 300];

function fmtDur(seconds: number): string {
  if (seconds < 60) return `${seconds} с`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m} мин ${s} с` : `${m} мин`;
}

export function TimerApp({ asanas, activeSession, labels }: Props) {
  const [selected, setSelected] = useState<PracticeAsanaStep[]>([]);
  const [defaultAsana, setDefaultAsana] = useState(60);
  const [defaultRest, setDefaultRest] = useState(15);
  const [view, setView] = useState<"setup" | "run">("setup");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [active, setActive] = useState<ActiveSession | null>(
    activeSession?.active ? activeSession : null,
  );
  const [abandoning, setAbandoning] = useState(false);
  const [abandonError, setAbandonError] = useState(false);

  const selectedNames = useMemo(() => new Set(selected.map((a) => a.name)), [selected]);
  const available = useMemo(
    () => asanas.filter((a) => !selectedNames.has(a.name)),
    [asanas, selectedNames],
  );

  const addAsana = (name: string, imageUrl: string | null) => {
    if (selectedNames.has(name)) return;
    setSelected((prev) => [
      ...prev,
      { name, image_url: imageUrl, duration_seconds: defaultAsana, rest_seconds: defaultRest },
    ]);
    setStartError(null);
  };

  const removeAsana = (index: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== index));
  };

  const moveAsana = (index: number, dir: -1 | 1) => {
    setSelected((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const updateDefault = (asana: boolean, value: number) => {
    if (asana) {
      setDefaultAsana(value);
      setSelected((prev) => prev.map((a) => ({ ...a, duration_seconds: value })));
    } else {
      setDefaultRest(value);
      setSelected((prev) => prev.map((a) => ({ ...a, rest_seconds: value })));
    }
  };

  const handleStart = async () => {
    if (selected.length === 0) return;
    setStarting(true);
    setStartError(null);
    try {
      const res = await fetch("/api/practice/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setStartError(data.error === "start_failed" ? labels.startError : labels.stopError);
        return;
      }
      setSessionId((data.id as number) ?? null);
      setActive(null);
      setView("run");
    } catch {
      setStartError(labels.stopError);
    } finally {
      setStarting(false);
    }
  };

  const handleAbandon = async () => {
    if (!active?.id) return;
    setAbandoning(true);
    setAbandonError(false);
    try {
      const res = await fetch(`/api/practice/${active.id}`, { method: "DELETE" });
      if (!res.ok) {
        setAbandonError(true);
        return;
      }
      setActive(null);
      setStartError(null);
    } catch {
      setAbandonError(true);
    } finally {
      setAbandoning(false);
    }
  };

  if (view === "run" && sessionId !== null) {
    return (
      <TimerScreen
        asanas={selected}
        startSessionId={sessionId}
        labels={labels.screen}
        onExit={() => setView("setup")}
        onRestart={() => {
          setView("setup");
        }}
      />
    );
  }

  if (active) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">{labels.title}</h1>
        <div className="mt-6 rounded-2xl border border-night-line bg-night/60 p-6">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
                aria-hidden
              >
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l2.5 2.5" />
                <path d="M9 2h6" />
              </svg>
            </span>
            <h2 className="mt-4 text-lg font-semibold">{labels.resumeTitle}</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">{labels.resumeText}</p>
            {abandonError && <p className="mt-3 text-sm text-rose-400">{labels.resumeError}</p>}
            <button
              type="button"
              disabled={abandoning}
              onClick={() => {
                void handleAbandon();
              }}
              className="mt-6 h-14 w-full max-w-sm rounded-full bg-accent text-base font-semibold text-night transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {abandoning ? "…" : labels.resumeAction}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const Select = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (v: number) => void;
    label: string;
  }) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 rounded-lg border border-night-line bg-night px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
      >
        {DURATION_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {fmtDur(s)}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">{labels.title}</h1>

      <div className="mt-6 rounded-2xl border border-night-line bg-night/60 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {labels.defaultTime}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Select
            label={labels.asanaLabel}
            value={defaultAsana}
            onChange={(v) => updateDefault(true, v)}
          />
          <Select
            label={labels.restLabel}
            value={defaultRest}
            onChange={(v) => updateDefault(false, v)}
          />
        </div>
      </div>

      <div className="mt-4">
        {selected.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-night-line px-6 py-10 text-center">
            <p className="text-3xl">🧘</p>
            <p className="mt-3 text-sm text-muted">{labels.addHint}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-night-line bg-night/60">
            <h2 className="px-4 pt-4 text-sm font-semibold uppercase tracking-wide text-muted">
              {labels.selectedTitle.replace("{count}", String(selected.length))}
            </h2>
            <div className="mt-2 flex flex-col gap-1 p-2">
              {selected.map((step, index) => (
                <div
                  key={`${index}-${step.name}`}
                  className="flex items-center gap-2 rounded-xl border border-night-line bg-night/40 px-3 py-2.5"
                >
                  <span className="w-5 text-center text-xs text-muted">{index + 1}</span>
                  <span className="flex-1 truncate text-sm font-medium">{step.name}</span>
                  <span className="text-[11px] text-muted">
                    {labels.durationCombine.replace("{duration}", fmtDur(step.duration_seconds))} ·{" "}
                    {labels.restCombine.replace("{rest}", fmtDur(step.rest_seconds))}
                  </span>
                  <button
                    type="button"
                    title={labels.moveUp}
                    disabled={index === 0}
                    onClick={() => moveAsana(index, -1)}
                    className="rounded-lg p-1 text-muted transition-colors hover:text-ink disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    title={labels.moveDown}
                    disabled={index === selected.length - 1}
                    onClick={() => moveAsana(index, 1)}
                    className="rounded-lg p-1 text-muted transition-colors hover:text-ink disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    title={labels.remove}
                    onClick={() => removeAsana(index)}
                    className="rounded-lg p-1 text-muted transition-colors hover:text-ink"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-night-line bg-night/60">
        <h2 className="px-4 pt-4 text-sm font-semibold uppercase tracking-wide text-muted">
          {labels.availableTitle}
        </h2>
        <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto p-2">
          {available.map((asana) => {
            const img = mediaUrl(asana.image_url);
            return (
              <button
                key={asana.name}
                type="button"
                onClick={() => addAsana(asana.name, asana.image_url)}
                className="flex items-center gap-3 rounded-xl border border-night-line bg-night/40 px-3 py-2 text-left transition-colors hover:border-accent/50"
              >
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-night-soft/40">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xl text-accent/70">
                      🧘
                    </span>
                  )}
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-night">
                    +
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{asana.name}</span>
                  <span className="block truncate text-xs text-muted">{asana.categoryLabel}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {startError && (
        <p className="mt-4 text-sm text-rose-400">{startError}</p>
      )}

      <button
        type="button"
        disabled={selected.length === 0 || starting}
        onClick={() => {
          void handleStart();
        }}
        className="mt-6 h-14 w-full rounded-full bg-accent text-base font-semibold text-night transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {labels.start.replace("{count}", String(selected.length))}
      </button>
    </div>
  );
}