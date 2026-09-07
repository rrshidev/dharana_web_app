import { CHART } from "./colors";

/** Мини-линия (sparkline) для стат-карточек. */
export function Sparkline({
  data,
  color = CHART.accent,
  width = 64,
  height = 32,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <span className="text-xs text-muted" style={{ width, height }}>
        —
      </span>
    );
  }
  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV === 0 ? 1 : maxV - minV;

  const points = data
    .map((v, i) => {
      const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * width;
      const y = height - ((v - minV) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} aria-hidden className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}