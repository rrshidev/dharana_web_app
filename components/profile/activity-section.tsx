"use client";

import type { DayActivity } from "@/lib/stats/aggregate";
import { ActivityChart } from "@/components/charts/activity-chart";
import { PeriodSelector } from "@/components/charts/period-selector";

export function ActivitySection({
  days,
  points,
  labels,
}: {
  days: number;
  points: DayActivity[];
  labels: {
    title: string;
    legendMinutes: string;
    legendSessions: string;
    legendAsanas: string;
    minUnit: string;
    sesUnit: string;
    asaUnit: string;
  };
}) {
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