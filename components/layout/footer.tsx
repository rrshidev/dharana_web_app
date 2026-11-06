import Link from "next/link";
import { CookieSettingsButton } from "@/components/legal/cookie-settings-button";

type T = (key: string) => string;

export function Footer({ locale, t }: { locale: string; t: T }) {
  return (
    <footer className="border-t border-night-line py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 text-xs text-muted">
        <nav
          aria-label={t("footer.legalNav")}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        >
          <Link href={`/${locale}/privacy`} className="transition-colors hover:text-accent-ink">
            {t("legal.privacyLink")}
          </Link>
          <Link href={`/${locale}/consent`} className="transition-colors hover:text-accent-ink">
            {t("legal.consentLink")}
          </Link>
          <Link href={`/${locale}/about`} className="transition-colors hover:text-accent-ink">
            {t("legal.aboutLink")}
          </Link>
          <CookieSettingsButton label={t("legal.cookieSettings")} />
        </nav>
        <span>
          {t("brand")} · 2026
        </span>
        <span>{t("footer.rights")}</span>
      </div>
    </footer>
  );
}
