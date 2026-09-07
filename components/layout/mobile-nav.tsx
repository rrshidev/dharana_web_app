"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/settings";
import { HomeIcon, TimerIcon, HeartIcon, UserIcon } from "@/components/icons";

export interface MobileNavLabels {
  overview: string;
  timer: string;
  favorites: string;
  profile: string;
}

const items: Array<{ key: string; icon: typeof HomeIcon; match: (path: string) => boolean }> = [
  { key: "overview", icon: HomeIcon, match: (p) => p.endsWith("/overview") },
  { key: "timer", icon: TimerIcon, match: (p) => p.endsWith("/timer") },
  { key: "favorites", icon: HeartIcon, match: (p) => p.endsWith("/favorites") },
  { key: "profile", icon: UserIcon, match: (p) => p.includes("/profile") },
];

/**
 * App-like fixed bottom tab bar — shown only for authenticated users on
 * mobile (sm hidden). Mirrors the phone app's main navigation (Главная /
 * Таймер / Избранное / Профиль).
 */
export function MobileNav({ locale, labels }: { locale: Locale; labels: MobileNavLabels }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { user?: unknown }) => {
        if (active) setAuthed(Boolean(data.user));
      })
      .catch(() => {
        if (active) setAuthed(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!authed) return null;

  const label = (key: string): string =>
    key === "overview"
      ? labels.overview
      : key === "timer"
        ? labels.timer
        : key === "favorites"
          ? labels.favorites
          : labels.profile;

  return (
    <>
      <div style={{ height: "calc(3.75rem + env(safe-area-inset-bottom))" }} aria-hidden />
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-night-line bg-night/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
        aria-label="Основная навигация"
      >
        <div className="mx-auto grid h-[3.75rem] max-w-md grid-cols-4">
          {items.map(({ key, icon: Icon, match }) => {
            const href = `/${locale}/${key}`;
            const active = match(pathname);
            return (
              <Link
                key={key}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                  active ? "text-accent" : "text-muted hover:text-ink"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label(key)}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}