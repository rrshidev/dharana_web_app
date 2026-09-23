"use client";

import { useState } from "react";
import type { DayActivity } from "@/lib/stats/aggregate";
import { ActivityChart } from "@/components/charts/activity-chart";
import { PeriodSelector } from "@/components/charts/period-selector";

export type PracticeTypeFilter = "all" | "asana" | "meditation" | "pranayama";

export function ActivitySection({
  days,
  series,
  labels,
}: {
  days: number;
  series: Partial<Record<PracticeTypeFilter, DayActivity[]>>;
  labels: {
    title: string;
    tabs: Record<PracticeTypeFilter, string>;
    legendMinutes: string;
    legendSessions: string;
    legendAsanas: string;
    minUnit: string;
    sesUnit: string;
    asaUnit: string;
  };
}) {
  const [active, setActive] = useState<PracticeTypeFilter>("all");
  const tabs: PracticeTypeFilter[] = ["all", "asana", "meditation", "pranayama"];
  const points = series[active] ?? [];

  return (
    <section className="mt-6 rounded-2xl border border-night-line bg-night/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{labels.title}</h2>
        <PeriodSelector
          days={days}
          chips={[7, 30, 90].map((v) => ({
            value: v,
            label: `${v}`,
          }))}
        />
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {tabs.map((t) => {
          const isActive = active === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              aria-pressed={isActive}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-accent text-night"
                  : "border border-night-line text-muted hover:text-ink"
              }`}
            >
              {labels.tabs[t]}
            </button>
          );
        })}
      </div>
      <ActivityChart
        days={points}
        labels={{
          minutes: labels.minUnit,
          sessions: labels.sesUnit,
          asanas: labels.asaUnit,
        }}
        legend={{
          minutes: labels.legendMinutes,
          sessions: labels.legendSessions,
          asanas: labels.legendAsanas,
        }}
      />
    </section>
  );
}