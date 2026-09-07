"use client";

import { CHART } from "./colors";

interface TooltipItem {
  name?: string;
  value?: number | string;
  color?: string;
}

/** Общий тултип для графиков в фирменных цветах. */
export function ChartTooltip({
  active,
  payload,
  label,
  showLabel = true,
}: {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string | number;
  showLabel?: boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      className="pointer-events-none rounded-lg px-2.5 py-1.5 text-xs shadow-lg"
      style={{
        background: CHART.tooltipBg,
        color: CHART.tooltipText,
        boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
      }}
    >
      {showLabel && label != null && (
        <div className="mb-1 font-semibold opacity-80">{label}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color ?? CHART.accent }}
          />
          {p.name ? <span className="font-semibold">{p.name}:</span> : null}
          <span>{p.value ?? 0}</span>
        </div>
      ))}
    </div>
  );
}