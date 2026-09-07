"use client";

import type {
  AdminActivityEvent,
  AdminMetrics,
  AdminSeries,
  AdminStats,
} from "@/lib/api/admin";
import { ChartCard } from "@/components/charts/chart-card";
import { Sparkline } from "@/components/charts/sparkline";
import { AreaTrendChart } from "@/components/charts/area-trend-chart";
import { MultiLineChart, ChartLegend } from "@/components/charts/multi-line-chart";
import { DonutRate } from "@/components/charts/donut-rate";
import { PeriodSelector } from "@/components/charts/period-selector";
import { CHART } from "@/components/charts/colors";

interface OverviewLabels {
  statUsers: string;
  statPremium: string;
  statPractices: string;
  statMinutes: string;
  statNewWeek: string;
  practicesChartTitle: string;
  growthTitle: string;
  legendNew: string;
  legendPremium: string;
  donutTitle: string;
  kvTitle: string;
  kvDau: string;
  kvWau: string;
  kvMau: string;
  kvSessionsToday: string;
  recentTitle: string;
  recentNewUser: string;
  recentPractice: string;
  noData: string;
  noRecent: string;
  minUnit: string;
  conversion: string;
  periodChips: Record<string, string>;
}

function fmtInt(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(".", ",")}k` : String(Math.round(n));
}

export function OverviewPanel({
  days,
  stats,
  series,
  metrics,
  activity,
  labels,
}: {
  days: number;
  stats: AdminStats | null;
  series: AdminSeries | null;
  metrics: AdminMetrics | null;
  activity: AdminActivityEvent[];
  labels: OverviewLabels;
}) {
  const d = series?.days ?? [];
  const counts = {
    users: stats?.total_users ?? 0,
    premium: stats?.premium_users ?? 0,
    practices: stats?.total_sessions ?? 0,
    minutes: Math.round(stats?.total_practice_minutes ?? 0),
    newWeek: stats?.new_users_week ?? 0,
  };
  const conversion = stats?.conversion_rate ?? 0;

  const cards = [
    {
      key: "users",
      label: labels.statUsers,
      value: fmtInt(counts.users),
      fill: CHART.accent,
      spark: (series?.new_users ?? []).slice(-31),
    },
    {
      key: "premium",
      label: labels.statPremium,
      value: fmtInt(counts.premium),
      fill: CHART.sage,
      spark: (series?.new_premium ?? []).slice(-31),
    },
    {
      key: "practices",
      label: labels.statPractices,
      value: fmtInt(counts.practices),
      fill: CHART.blue,
      spark: (series?.practices ?? []).slice(-31),
    },
    {
      key: "minutes",
      label: labels.statMinutes,
      value: fmtInt(counts.minutes),
      fill: CHART.accent,
      spark: [],
    },
    {
      key: "newWeek",
      label: labels.statNewWeek,
      value: fmtInt(counts.newWeek),
      fill: CHART.sage,
      spark: [],
    },
  ];

  const areaData = d.map((label, i) => ({
    label,
    value: series?.practices?.[i] ?? 0,
  }));
  const multiData = d.map((label, i) => ({
    label,
    new_users: series?.new_users?.[i] ?? 0,
    premium: series?.new_premium?.[i] ?? 0,
  }));
  const multiSeries = [
    { key: "new_users", name: labels.legendNew, color: CHART.accent },
    { key: "premium", name: labels.legendPremium, color: CHART.sage },
  ];

  const kv = [
    { label: labels.kvDau, value: metrics?.active_users.dau ?? 0 },
    { label: labels.kvWau, value: metrics?.active_users.wau ?? 0 },
    { label: labels.kvMau, value: metrics?.active_users.mau ?? 0 },
    { label: labels.kvSessionsToday, value: metrics?.active_users.sessions_today ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodSelector
          days={days}
          chips={[7, 30, 90].map((v) => ({ value: v, label: labels.periodChips[String(v)] }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {cards.map((c) => (
          <div
            key={c.key}
            className="rounded-2xl border border-night-line bg-night/60 p-4"
          >
            <p className="text-base font-semibold">{c.value}</p>
            <p className="mt-1 text-[11px] leading-tight text-muted">{c.label}</p>
            {c.spark.length > 1 && (
              <div className="mt-2">
                <Sparkline data={c.spark} color={c.fill} height={34} />
              </div>
            )}
          </div>
        ))}
      </div>

      <ChartCard title={labels.practicesChartTitle}>
        <AreaTrendChart data={areaData} color={CHART.accent} height={180} />
      </ChartCard>

      <ChartCard title={labels.growthTitle}>
        <MultiLineChart data={multiData} series={multiSeries} height={180} />
        <div className="mt-3">
          <ChartLegend series={multiSeries} />
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChartCard title={labels.donutTitle}>
          <div className="flex flex-col items-center gap-3 py-2">
            <DonutRate value={conversion} size={130} />
            <p className="text-xs text-muted">
              {labels.legendPremium}: {fmtInt(counts.premium)} ·{" "}
              {labels.conversion}: {conversion.toFixed(1)}%
            </p>
          </div>
        </ChartCard>

        <ChartCard title={labels.kvTitle}>
          <div className="grid grid-cols-2 gap-3">
            {kv.map((k) => (
              <div key={k.label} className="rounded-xl bg-night/40 px-3 py-3">
                <p className="text-xl font-semibold">{fmtInt(k.value)}</p>
                <p className="mt-0.5 text-[11px] text-muted">{k.label}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title={labels.recentTitle}>
        {activity.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">{labels.noRecent}</p>
        ) : (
          <ul className="divide-y divide-night-line">
            {activity.slice(0, 20).map((ev, i) => (
              <li key={i} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 py-2.5 text-sm">
                <span
                  className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                    ev.type === "practice" ? "bg-accent" : "bg-sage"
                  }`}
                />
                <span className="font-medium">
                  {ev.type === "practice"
                    ? labels.statPractices
                    : labels.recentNewUser}
                </span>
                <span className="text-muted">·</span>
                {ev.user_name && <span className="text-ink">{ev.user_name}</span>}
                {ev.type === "practice" && (
                  <span className="text-muted">
                    {labels.recentPractice
                      .replace("%asanas_count%", String(ev.asanas_count ?? 0))
                      .replace("%duration%", String(Math.round((ev.duration_seconds ?? 0) / 60)))}
                  </span>
                )}
                <span className="ml-auto text-xs text-muted">
                  {formatTs(ev.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ChartCard>
    </div>
  );
}

function formatTs(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}