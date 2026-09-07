import { CHART } from "./colors";

/** Доунт-кольцо (доля 0..100) с подписью в центре. */
export function DonutRate({
  value,
  centerLabel,
  subLabel,
  size = 96,
}: {
  value: number;
  centerLabel?: string;
  subLabel?: string;
  size?: number;
}) {
  const stroke = size * 0.14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const filled = (clamped / 100) * c;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-label={centerLabel}
    >
      <svg width={size} height={size} aria-hidden className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(46,47,74,0.9)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={CHART.sage}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-lg font-extrabold text-ink">
          {centerLabel || `${Math.round(clamped)}%`}
        </span>
        {subLabel && (
          <span className="text-[10px] leading-tight text-muted">{subLabel}</span>
        )}
      </div>
    </div>
  );
}