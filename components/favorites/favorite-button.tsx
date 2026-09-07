"use client";

import { useCallback, useState } from "react";
import { HeartIcon, HeartFilledIcon } from "@/components/icons";

export interface FavoriteButtonLabels {
  add: string;
  remove: string;
}

/**
 * Optimistic favorite toggle. Talks to the same-origin proxy route handler
 * (/api/favorites/[name]) which reads the httpOnly session cookie for us.
 * On 401 it bounces the user to login (guests never see this button).
 */
export function FavoriteButton({
  name,
  initial,
  labels,
  size = "sm",
}: {
  name: string;
  initial: boolean;
  labels: FavoriteButtonLabels;
  size?: "sm" | "lg";
}) {
  const [active, setActive] = useState(initial);
  const [busy, setBusy] = useState(false);

  const toggle = useCallback(async () => {
    if (busy) return;
    const prev = active;
    setActive(!prev);
    setBusy(true);
    try {
      const res = await fetch(`/api/favorites/${encodeURIComponent(name)}`, {
        method: prev ? "DELETE" : "POST",
      });
      if (res.status === 401) {
        const next = encodeURIComponent(window.location.pathname);
        window.location.assign(`/${window.location.pathname.split("/")[1] || "ru"}/login?next=${next}`);
        return;
      }
      if (!res.ok) setActive(prev);
    } catch {
      setActive(prev);
    } finally {
      setBusy(false);
    }
  }, [name, active, busy]);

  const pad = size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const icon = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? labels.remove : labels.add}
      title={active ? labels.remove : labels.add}
      className={`flex ${pad} shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
        active
          ? "bg-accent/20 text-accent"
          : "bg-night/70 text-ink/70 backdrop-blur hover:text-ink"
      } ${busy ? "opacity-60" : ""}`}
    >
      {active ? (
        <HeartFilledIcon className={`${icon} ${busy ? "opacity-40" : ""}`} />
      ) : (
        <HeartIcon className={`${icon} ${busy ? "opacity-40" : ""}`} />
      )}
    </button>
  );
}