"use client";

import { openCookieSettings } from "@/lib/legal/consent-store";

export function CookieSettingsButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={className ?? "transition-colors hover:text-accent-ink"}
    >
      {label}
    </button>
  );
}
