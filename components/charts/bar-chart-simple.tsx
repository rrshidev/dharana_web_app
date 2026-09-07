"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART } from "./colors";
import { ChartTooltip } from "./chart-tooltip";
import { barWidth, labelInterval, shortDay } from "./format";

export function BarChartSimple({
  data,
  color = CHART.accent,
  height = 160,
  metric = "",
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  metric?: string;
}) {
  if (data.length === 0) {
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
        <BarChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
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
            cursor={{ fill: "rgba(237,234,242,0.03)" }}
          />
          <Bar
            dataKey="value"
            name={metric || undefined}
            fill={color}
            radius={[3, 3, 0, 0]}
            barSize={barWidth(data.length)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}