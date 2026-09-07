"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminTabs({
  locale,
  tabs,
}: {
  locale: string;
  tabs: { key: string; label: string }[];
}) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-1.5">
      {tabs.map((tab) => {
        const href = `/${locale}/admin/${tab.key === "overview" ? "" : tab.key}`;
        const isActive =
          tab.key === "overview"
            ? pathname === `/${locale}/admin` || pathname === `/${locale}/admin/`
            : pathname.startsWith(href);
        return (
          <Link
            key={tab.key}
            href={href}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent text-night"
                : "border border-night-line text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}