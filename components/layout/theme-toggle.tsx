"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

const STORAGE_KEY = "dharana:theme";
const THEME_EVENT = "dharana:themechange";

export type Theme = "dark" | "light";

// Светлая тема — дефолтная (в globals.css палитра по умолчанию светлая,
// тёмная включается атрибутом data-theme="dark").
function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  if (theme === "light") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = "dark";
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage недоступен (приватный режим) — тему применяем, но не сохраняем
    }
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
  }
}

export function ThemeToggle({
  lightLabel,
  darkLabel,
}: {
  lightLabel: string;
  darkLabel: string;
}) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(getInitialTheme());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as Theme | undefined;
      if (detail === "light" || detail === "dark") setTheme(detail);
    };
    window.addEventListener(THEME_EVENT, onChange);
    return () => window.removeEventListener(THEME_EVENT, onChange);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? lightLabel : darkLabel}
      title={theme === "dark" ? lightLabel : darkLabel}
      className="rounded-full border border-night-line p-2 text-muted transition-colors hover:text-ink"
    >
      {theme === "dark" ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
    </button>
  );
}