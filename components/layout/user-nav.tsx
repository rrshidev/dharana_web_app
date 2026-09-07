"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/settings";

export interface UserNavLabels {
  login: string;
  logout: string;
}

export interface UserNavLink {
  href: string;
  label: string;
}

type AuthState = "loading" | "guest" | "user";

export function UserNav({
  locale,
  links,
  labels,
}: {
  locale: Locale;
  links: UserNavLink[];
  labels: UserNavLabels;
}) {
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.assign(`/${locale}`);
    }
  };

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
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hidden text-muted transition-colors hover:text-ink sm:block"
          >
            {link.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => {
            void handleLogout();
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