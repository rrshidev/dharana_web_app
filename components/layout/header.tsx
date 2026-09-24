import Link from "next/link";
import type { Locale } from "@/lib/i18n/settings";
import { UserNav } from "./user-nav";
import { BrandMark } from "./brand";

type T = (key: string) => string;

export function Header({ locale, t }: { locale: Locale; t: T }) {
  return (
    <header className="sticky top-0 z-20 border-b border-night-line bg-night/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-accent text-night">
            <BrandMark className="h-[76%] w-auto" />
          </span>
          <span className="text-xl font-semibold tracking-tight">{t("brand")}</span>
        </Link>
        <UserNav
          locale={locale}
          landingLinks={[
            { href: `/${locale}#features`, label: t("nav.features") },
            { href: `/${locale}#channels`, label: t("nav.channels") },
            { href: `/${locale}#contacts`, label: t("nav.contacts") },
          ]}
          links={[
            { href: `/${locale}/overview`, label: t("nav.overview") },
            { href: `/${locale}/timer`, label: t("nav.timer") },
            { href: `/${locale}/favorites`, label: t("nav.favorites") },
            { href: `/${locale}/profile`, label: t("nav.profile") },
          ]}
          labels={{
            login: t("nav.login"),
            logout: t("nav.logout"),
          }}
        />
      </div>
    </header>
  );
}