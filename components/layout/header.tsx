import Link from "next/link";
import type { Locale } from "@/lib/i18n/settings";
import { UserNav } from "./user-nav";
import { BrandMark } from "./brand";

type T = (key: string) => string;

export function Header({ locale, t }: { locale: Locale; t: T }) {
  const other: Locale = locale === "ru" ? "en" : "ru";

  return (
    <header className="sticky top-0 z-20 border-b border-night-line bg-night/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-accent text-night">
            <BrandMark className="h-[76%] w-auto" />
          </span>
          <span className="text-xl font-semibold tracking-tight">{t("brand")}</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href={`/${locale}#features`} className="hidden text-muted transition-colors hover:text-ink sm:block">
            {t("nav.features")}
          </Link>
          <Link href={`/${locale}#channels`} className="hidden text-muted transition-colors hover:text-ink sm:block">
            {t("nav.channels")}
          </Link>
          <Link href={`/${locale}#contacts`} className="hidden text-muted transition-colors hover:text-ink sm:block">
            {t("nav.contacts")}
          </Link>
          <UserNav
            locale={locale}
            labels={{
              catalog: t("nav.catalog"),
              login: t("nav.login"),
              logout: t("nav.logout"),
            }}
          />
          <Link
            href={`/${other}`}
            className="rounded-full border border-night-line px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            {other.toUpperCase()}
          </Link>
        </nav>
      </div>
    </header>
  );
}