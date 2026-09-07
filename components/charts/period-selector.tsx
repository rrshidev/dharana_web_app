"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Переключатель периода 7/30/90 дней — обновляет query-параметр `days`. */
export function PeriodSelector({
  days,
  chips,
}: {
  days: number;
  chips: { value: number; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const select = (value: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", String(value));
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  };

  return (
    <div className="flex gap-1.5">
      {chips.map((c) => {
        const active = days === c.value;
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => select(c.value)}
            aria-pressed={active}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              active
                ? "bg-accent text-night"
                : "border border-night-line text-muted hover:text-ink"
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}