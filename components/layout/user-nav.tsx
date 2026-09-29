"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/settings";
import { ThemeToggle } from "./theme-toggle";

export interface UserNavLabels {
  login: string;
  logout: string;
  themeLight: string;
  themeDark: string;
}

export interface UserNavLink {
  href: string;
  label: string;
}

export interface LandingNavLink {
  href: string;
  label: string;
}

type AuthState = "loading" | "guest" | "user";

export function UserNav({
  locale,
  links,
  landingLinks,
  labels,
}: {
  locale: Locale;
  links: UserNavLink[];
  landingLinks: LandingNavLink[];
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

  const other: Locale = locale === "ru" ? "en" : "ru";
  const themeToggle = (
    <ThemeToggle lightLabel={labels.themeLight} darkLabel={labels.themeDark} />
  );
  const languageSwitch = (
    <Link
      href={`/${other}`}
      className="rounded-full border border-night-line px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-ink"
    >
      {other.toUpperCase()}
    </Link>
  );

  if (state === "loading") {
    return (
      <span className="flex items-center gap-2">
        {themeToggle}
        <span
          className="hidden h-6 w-20 animate-pulse rounded-full bg-night-line sm:block"
          aria-hidden
        />
      </span>
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
        <span className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            className="rounded-full border border-night-line px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            {labels.logout}
          </button>
          {languageSwitch}
          {themeToggle}
        </span>
      </>
    );
  }

  return (
    <>
      {landingLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="hidden text-muted transition-colors hover:text-ink sm:block"
        >
          {link.label}
        </Link>
      ))}
      <span className="flex items-center gap-1.5">
        <Link
          href={`/${locale}/login`}
          className="rounded-full border border-night-line px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-ink sm:block"
        >
          {labels.login}
        </Link>
        {languageSwitch}
        {themeToggle}
      </span>
    </>
  );
}