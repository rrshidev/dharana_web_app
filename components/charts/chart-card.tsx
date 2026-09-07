import type { ReactNode } from "react";

export function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-night-line bg-night/60 p-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[15px] font-semibold text-ink">{title}</span>
        {subtitle != null && <span className="shrink-0">{subtitle}</span>}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}