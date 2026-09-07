"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/settings";

export interface UserNavLabels {
  catalog: string;
  login: string;
  logout: string;
}

type AuthState = "loading" | "guest" | "user";

export function UserNav({ locale, labels }: { locale: Locale; labels: UserNavLabels }) {
  const [state, setState] = useState<AuthState>("loading");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { user?: unknown }) => {
        if (active) setState(data.user ? "user" : "guest");
      })
      .catch(() => {
        if (active) setState("guest");
      });
    return () => {
      active = false;
    };
  }, []);

  if (state === "loading") {
    return (
      <span
        className="hidden h-6 w-20 animate-pulse rounded-full bg-night-line sm:block"
        aria-hidden
      />
    );
  }

  if (state === "user") {
    return (
      <>
        <Link
          href={`/${locale}/catalog`}
          className="hidden text-muted transition-colors hover:text-ink sm:block"
        >
          {labels.catalog}
        </Link>
        <button
          type="button"
          onClick={() => {
            void fetch("/api/auth/logout", { method: "POST" });
            window.location.assign(`/${locale}`);
          }}
          className="rounded-full border border-night-line px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-ink"
        >
          {labels.logout}
        </button>
      </>
    );
  }

  return (
    <Link
      href={`/${locale}/login`}
      className="rounded-full border border-night-line px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-ink sm:block"
    >
      {labels.login}
    </Link>
  );
}