"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART } from "./colors";
import { ChartTooltip } from "./chart-tooltip";
import { labelInterval, shortDay } from "./format";

export function AreaTrendChart({
  data,
  color = CHART.accent,
  height = 180,
  showBottomLabels = true,
  metric = "",
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  showBottomLabels?: boolean;
  metric?: string;
}) {
  if (data.length === 0) return <Empty height={height} />;
  const gradientId = `gradient-${color.replace("#", "")}-${data.length}`;

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={CHART.grid}
            strokeWidth={1}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tickFormatter={(v) => shortDay(v)}
            interval={labelInterval(data.length) - 1}
            tick={{ fontSize: 9, fill: CHART.muted }}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            height={showBottomLabels ? 22 : 0}
            hide={!showBottomLabels}
          />
          <YAxis hide width={0} domain={[0, "auto"]} />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: CHART.muted, strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name={metric || undefined}
            stroke={color}
            strokeWidth={2.4}
            fill={`url(#${gradientId})`}
            dot={data.length <= 31 ? { r: 2.5 } : false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Empty({ height }: { height?: number }) {
  return (
    <div
      className="flex items-center justify-center text-sm text-muted"
      style={{ height: height ?? 160 }}
    >
      Нет данных за период
    </div>
  );
}