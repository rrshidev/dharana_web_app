"use client";

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
import { ChartTooltip } from "./chart-tooltip";
import { labelInterval, shortDay } from "./format";

export interface ChartSeriesDef {
  key: string;
  name: string;
  color: string;
}

export function MultiLineChart({
  data,
  series,
  height = 180,
}: {
  data: Record<string, number | string>[];
  series: ChartSeriesDef[];
  height?: number;
}) {
  if (data.length === 0 || series.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted"
        style={{ height: height ?? 160 }}
      >
        Нет данных за период
      </div>
    );
  }
  return (
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
          <YAxis hide width={0} domain={[0, "auto"]} />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: CHART.muted, strokeDasharray: "3 3" }}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Горизонтальная легенда с цветными точками. */
export function ChartLegend({
  series,
}: {
  series: { name: string; color: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {series.map((s) => (
        <span key={s.name} className="flex items-center gap-1.5 text-xs text-muted">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: s.color }}
          />
          {s.name}
        </span>
      ))}
    </div>
  );
}