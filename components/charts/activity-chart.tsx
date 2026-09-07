"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART } from "./colors";
import { labelInterval, shortDay } from "./format";

export interface ActivityPoint {
  label: string;
  minutes: number;
  sessions: number;
  asanas: number;
}

interface ActivityChartProps {
  days: ActivityPoint[];
  height?: number;
  labels: { minutes: string; sessions: string; asanas: string };
  legend: { minutes: string; sessions: string; asanas: string };
}

/** График активности профиля: минуты / сессии / асаны (нормализованы по своей шкале). */
export function ActivityChart({ days, height = 200, labels, legend }: ActivityChartProps) {
  const maxes = useMemo(() => {
    const maxMin = Math.max(1, ...days.map((d) => d.minutes));
    const maxSes = Math.max(1, ...days.map((d) => d.sessions));
    const maxAsa = Math.max(1, ...days.map((d) => d.asanas));
    return { maxMin, maxSes, maxAsa };
  }, [days]);

  const data = useMemo(
    () =>
      days.map((d) => ({
        label: d.label,
        minutes: d.minutes / maxes.maxMin,
        sessions: d.sessions / maxes.maxSes,
        asanas: d.asanas / maxes.maxAsa,
      })),
    [days, maxes],
  );

  const totals = useMemo(
    () => ({
      minutes: Math.round(days.reduce((a, d) => a + d.minutes, 0)),
      sessions: Math.round(days.reduce((a, d) => a + d.sessions, 0)),
      asanas: Math.round(days.reduce((a, d) => a + d.asanas, 0)),
    }),
    [days],
  );

  const series = [
    { key: "minutes", name: legend.minutes, color: CHART.accent, max: maxes.maxMin },
    { key: "sessions", name: legend.sessions, color: CHART.sage, max: maxes.maxSes },
    { key: "asanas", name: legend.asanas, color: CHART.blue, max: maxes.maxAsa },
  ];

  if (days.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted">
        Нет данных за период
      </div>
    );
  }

  return (
    <div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} strokeWidth={1} vertical={false} />
            <XAxis
              dataKey="label"
              tickFormatter={(v) => shortDay(v)}
              interval={labelInterval(data.length) - 1}
              tick={{ fontSize: 9, fill: CHART.muted }}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              height={22}
            />
            <YAxis hide width={0} domain={[0, 1]} />
            <Tooltip
              cursor={{ stroke: CHART.muted, strokeDasharray: "3 3" }}
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                return (
                  <div
                    className="pointer-events-none rounded-lg px-2.5 py-1.5 text-xs shadow-lg"
                    style={{ background: CHART.tooltipBg, color: CHART.tooltipText }}
                  >
                    <div className="mb-1 font-semibold opacity-80">{label}</div>
                    {payload.map((p) => {
                      const s = series.find((x) => x.key === p.dataKey);
                      const raw = (Number(p.value) * (s?.max ?? 1)).toFixed(0);
                      const key = typeof p.dataKey === "string" ? p.dataKey : String(p.name ?? "");
                      return (
                        <div key={key} className="flex items-center gap-1.5">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ background: p.color ?? CHART.accent }}
                          />
                          <span className="font-semibold">{s?.name}:</span>
                          <span>{raw}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex justify-between gap-2">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-muted">{s.name}</span>
            <span className="font-semibold text-ink">
              {totals[s.key as keyof typeof totals]} {labels[s.key as keyof typeof labels]}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}