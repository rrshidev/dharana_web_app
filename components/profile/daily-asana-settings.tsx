"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

export interface DailyAsanaSettingsLabels {
  title: string;
  hint: string;
  enable: string;
  time: string;
  timezone: string;
  notLinked: string;
  saved: string;
  saveFailed: string;
}

const TIME_PRESETS = ["07:00", "08:00", "09:00", "10:00", "12:00", "18:00", "20:00", "21:00"];

// Как в клавиатуре бота (UTC-12..UTC+14 — полный диапазон земных поясов).
const TIMEZONE_OPTIONS = [
  "UTC",
  ...Array.from({ length: 12 }, (_, i) => `UTC-${12 - i}`),
  ...Array.from({ length: 14 }, (_, i) => `UTC+${i + 1}`),
];

export function DailyAsanaSettings({
  labels,
  initialEnabled,
  initialTime,
  initialTimezone,
  telegramLinked,
}: {
  labels: DailyAsanaSettingsLabels;
  initialEnabled: boolean;
  initialTime: string | null;
  initialTimezone: string;
  telegramLinked: boolean;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [time, setTime] = useState(initialTime ?? "09:00");
  const [timezone, setTimezone] = useState(initialTimezone);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  const save = useCallback(
    async (patch: Record<string, unknown>) => {
      setStatus("saving");
      try {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error("save failed");
        setStatus("saved");
        router.refresh();
      } catch {
        setStatus("failed");
      }
    },
    [router],
  );

  const timeOptions = TIME_PRESETS.includes(time) ? TIME_PRESETS : [time, ...TIME_PRESETS];
  const tzOptions = TIMEZONE_OPTIONS.includes(timezone)
    ? TIMEZONE_OPTIONS
    : [timezone, ...TIMEZONE_OPTIONS];

  return (
    <div className="rounded-2xl border border-night-line bg-night/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{labels.title}</h3>
          <p className="mt-0.5 text-xs text-muted">{labels.hint}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={labels.enable}
          onClick={() => {
            const next = !enabled;
            setEnabled(next);
            void save({ daily_asana_enabled: next });
          }}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            enabled ? "bg-accent" : "bg-night-soft"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              enabled ? "translate-x-[22px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">{labels.time}</span>
          <select
            value={time}
            disabled={!enabled}
            onChange={(e) => {
              setTime(e.target.value);
              void save({ daily_asana_time: e.target.value });
            }}
            className="w-full rounded-lg border border-night-line bg-night-soft px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent disabled:opacity-50"
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">{labels.timezone}</span>
          <select
            value={timezone}
            disabled={!enabled}
            onChange={(e) => {
              setTimezone(e.target.value);
              void save({ timezone: e.target.value });
            }}
            className="w-full rounded-lg border border-night-line bg-night-soft px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent disabled:opacity-50"
          >
            {tzOptions.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!telegramLinked && <p className="mt-3 text-xs text-muted">{labels.notLinked}</p>}

      <p className="mt-3 h-4 text-xs" aria-live="polite">
        {status === "saved" && <span className="text-accent-ink">{labels.saved}</span>}
        {status === "failed" && <span className="text-red-400">{labels.saveFailed}</span>}
      </p>
    </div>
  );
}
