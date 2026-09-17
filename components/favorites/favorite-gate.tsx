"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/settings";
import { HeartIcon } from "@/components/icons";
import { reachGoal } from "@/lib/analytics/metrica";

export interface FavoriteGateLabels {
  title: string;
  text: string;
  login: string;
  register: string;
}

/**
 * Favorites action for guests: heart button that opens a login prompt
 * instead of hitting the API. Used on catalog cards and the asana page
 * while catalog/asana are public for SEO.
 */
export function FavoriteGate({
  locale,
  next,
  labels,
  size = "sm",
}: {
  locale: Locale;
  next: string;
  labels: FavoriteGateLabels;
  size?: "sm" | "lg";
}) {
  const [open, setOpen] = useState(false);
  const loginHref = `/${locale}/login?next=${encodeURIComponent(next)}`;
  const registerHref = `/${locale}/register`;

  useEffect(() => {
    if (open) reachGoal("favorite_gate");
  }, [open]);

  const pad = size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const icon = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={labels.title}
        title={labels.title}
        className={`flex ${pad} shrink-0 items-center justify-center rounded-full bg-night/70 text-ink/70 backdrop-blur transition-colors hover:text-ink`}
      >
        <HeartIcon className={icon} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-night/70 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-night-line bg-night p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-ink"
            >
              ✕
            </button>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
              <HeartIcon className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold tracking-tight">{labels.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{labels.text}</p>
            <Link
              href={loginHref}
              className="mt-6 block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-night transition-opacity hover:opacity-90"
            >
              {labels.login}
            </Link>
            <Link
              href={registerHref}
              className="mt-3 block rounded-full border border-night-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent/50"
            >
              {labels.register}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}