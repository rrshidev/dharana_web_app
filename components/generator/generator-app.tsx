"use client";

import { useState } from "react";
import Link from "next/link";
import { mediaUrl } from "@/lib/api/media";
import type { PracticeAsanaStep } from "@/lib/api/timer";
import { TimerScreen, type TimerScreenLabels } from "@/components/timer/timer-screen";
import { PracticeGate } from "@/components/timer/practice-gate";

export interface GeneratorLabels {
  title: string;
  subtitle: string;
  difficulty: string;
  duration: string;
  focus: string;
  noFocus: string;
  difficulties: Record<string, string>;
  durations: Record<string, string>;
  focuses: Record<string, string>;
  generate: string;
  generating: string;
  error: string;
  resultTitle: string;
  total: string;
  calories: string;
  kcal: string;
  sec: string;
  asanas: string;
  startPractice: string;
  starting: string;
  startError: string;
  regenerate: string;
  limitTitle: string;
  limitText: string;
  limitCta: string;
  guestGateTitle: string;
  guestGateText: string;
  guestGateLogin: string;
  guestGateRegister: string;
  screen: TimerScreenLabels;
}

export interface GeneratedAsana extends PracticeAsanaStep {
  description?: string | null;
  category_id?: string | null;
  difficulty?: number | null;
}

interface GenerateResult {
  params: { difficulty: string; duration_minutes: number; focus: string | null };
  items: GeneratedAsana[];
  total_duration_seconds: number;
  estimated_calories: number;
  is_premium: boolean;
  can_generate: boolean;
  daily_generations_used: number;
  daily_generation_limit: number;
}

const DURATIONS = ["15", "30", "60"] as const;
const FOCUS_KEYS = ["back", "legs", "balance", "flexibility", "energy"] as const;
const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

function fmtMinutes(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m > 0 && s > 0) return `${m}:${String(s).padStart(2, "0")} мин`;
  if (m > 0) return `${m} мин`;
  return `${s} с`;
}

export function GeneratorApp({
  labels,
  locale,
  isAuthed,
}: {
  labels: GeneratorLabels;
  locale: string;
  isAuthed: boolean;
}) {
  const [difficulty, setDifficulty] = useState<string>("intermediate");
  const [duration, setDuration] = useState<string>("30");
  const [focus, setFocus] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState(false);
  const [gate, setGate] = useState(false);

  const [view, setView] = useState<"setup" | "run">("setup");
  const [starting, setStarting] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const generate = async () => {
    if (!isAuthed) {
      setGate(true);
      return;
    }
    setGenerating(true);
    setError(null);
    setLimitHit(false);
    setResult(null);
    try {
      const res = await fetch("/api/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty,
          duration_minutes: Number(duration),
          focus: focus || null,
        }),
      });
      if (res.status === 403) {
        setLimitHit(true);
        return;
      }
      if (!res.ok) {
        setError(labels.error);
        return;
      }
      const data: GenerateResult = await res.json();
      setResult(data);
    } catch {
      setError(labels.error);
    } finally {
      setGenerating(false);
    }
  };

  const start = async () => {
    if (!result) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/practice/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        setError(labels.startError);
        return;
      }
      const data: { id: number } = await res.json();
      setSessionId(data.id);
      setView("run");
    } catch {
      setError(labels.startError);
    } finally {
      setStarting(false);
    }
  };

  const backToSetup = () => {
    setView("setup");
    setSessionId(null);
  };

  const gateOverlay = gate && (
    <PracticeGate
      onClose={() => setGate(false)}
      goal="generator_gate"
      labels={{
        title: labels.guestGateTitle,
        text: labels.guestGateText,
        primary: labels.guestGateLogin,
        primaryHref: `/${locale}/login?next=${encodeURIComponent(`/${locale}/generator`)}`,
        secondary: labels.guestGateRegister,
        secondaryHref: `/${locale}/register`,
      }}
    />
  );

  if (view === "run" && result) {
    const asanas = result.items.map(
      (item): PracticeAsanaStep => ({
        ...item,
        image_url: mediaUrl(item.image_url),
      }),
    );
    return (
      <TimerScreen
        asanas={asanas}
        startSessionId={sessionId}
        labels={labels.screen}
        onExit={backToSetup}
        onRestart={backToSetup}
      />
    );
  }

  const chip = (
    value: string,
    active: boolean,
    label: string,
    onClick: () => void,
  ) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-night-line text-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{labels.title}</h1>
      {labels.subtitle && <p className="mt-2 text-sm text-muted">{labels.subtitle}</p>}

      {limitHit ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-night-line bg-night/60 px-6 py-14 text-center">
          <p className="text-3xl">⏳</p>
          <p className="mt-3 text-base font-semibold">{labels.limitTitle}</p>
          <p className="mt-1 text-sm text-muted">{labels.limitText}</p>
          <Link
            href={`/${locale}/profile/subscription`}
            className="mt-4 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-night transition-opacity hover:opacity-90"
          >
            {labels.limitCta}
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-6">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {labels.difficulty}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {DIFFICULTIES.map((d) =>
                  chip(
                    d,
                    difficulty === d,
                    labels.difficulties[d] ?? d,
                    () => {
                      setDifficulty(d);
                      setResult(null);
                    },
                  ),
                )}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {labels.duration}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {DURATIONS.map((d) =>
                  chip(
                    d,
                    duration === d,
                    labels.durations[d] ?? d,
                    () => {
                      setDuration(d);
                      setResult(null);
                    },
                  ),
                )}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {labels.focus}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {chip("", focus === "", labels.noFocus, () => setFocus(""))}
                {FOCUS_KEYS.map((f) =>
                  chip(
                    f,
                    focus === f,
                    labels.focuses[f] ?? f,
                    () => setFocus(f),
                  ),
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={generating}
            onClick={generate}
            className="mt-8 w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-night transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {generating ? labels.generating : labels.generate}
          </button>

          {error && (
            <p className="mt-4 rounded-2xl border border-night-line p-4 text-center text-sm text-muted">
              {error}
            </p>
          )}

          {result && (
            <div className="mt-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold tracking-tight">{labels.resultTitle}</h2>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  {labels.regenerate}
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-night-line bg-night/60 p-5">
                <ul className="space-y-2.5">
                  {result.items.map((item, idx) => (
                    <li key={`${item.name}-${idx}`} className="flex items-center justify-between gap-4 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-6 text-right text-xs text-muted tabular-nums">{idx + 1}.</span>
                        <span className="font-medium">{item.name}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted tabular-nums">
                        {item.duration_seconds} {labels.sec}
                        {item.rest_seconds > 0 ? ` + ${item.rest_seconds} ${labels.sec}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-night-line pt-4 text-sm">
                  <span className="text-muted">{labels.asanas}: {result.items.length}</span>
                  <span className="text-muted tabular-nums">{labels.total}: {fmtMinutes(result.total_duration_seconds)}</span>
                  {typeof result.estimated_calories === "number" && result.estimated_calories > 0 && (
                    <span className="text-muted tabular-nums">{labels.calories}: ~{result.estimated_calories} {labels.kcal}</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                disabled={starting}
                onClick={start}
                className="mt-4 w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-night transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {starting ? labels.starting : labels.startPractice}
              </button>
            </div>
          )}
        </>
      )}
      {gateOverlay}
    </section>
  );
}