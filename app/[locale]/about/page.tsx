import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { LEGAL } from "@/lib/legal/config";
import { CookieSettingsButton } from "@/components/legal/cookie-settings-button";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  const lng = locale === "en" ? "en" : "ru";
  return {
    title: `${t("about.title")} — ${t("brand")}`,
    description: t("about.lead"),
    alternates: {
      canonical: `${LEGAL.siteUrl}/${lng}/about`,
      languages: {
        ru: `${LEGAL.siteUrl}/ru/about`,
        en: `${LEGAL.siteUrl}/en/about`,
        "x-default": `${LEGAL.siteUrl}/ru/about`,
      },
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { t } = await getServerTranslation(locale);
  const whatItems = t("about.whatItems", { returnObjects: true }) as string[];

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t("about.eyebrow")}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t("about.title")}</h1>
      <p className="mt-5 text-base leading-7 text-muted">{t("about.lead")}</p>

      <div className="mt-9 rounded-2xl border border-night-line bg-night-soft/50 p-6">
        <h2 className="text-xl font-semibold tracking-tight">{t("about.missionTitle")}</h2>
        <p className="mt-3 text-sm leading-7 text-muted">{t("about.missionText")}</p>
      </div>

      <div className="mt-9">
        <h2 className="text-xl font-semibold tracking-tight">{t("about.whatTitle")}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
          {whatItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-9">
        <h2 className="text-xl font-semibold tracking-tight">{t("about.teamTitle")}</h2>
        <p className="mt-3 text-sm leading-7 text-muted">{t("about.teamText")}</p>
      </div>

      <div className="mt-9">
        <h2 className="text-xl font-semibold tracking-tight">{t("about.legalTitle")}</h2>
        <p className="mt-3 text-sm leading-7 text-muted">{t("about.legalText")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/${locale}/privacy`}
            className="rounded-2xl border border-night-line bg-night/60 p-4 transition-colors hover:border-accent/50"
          >
            <span className="block text-sm font-medium">{t("legal.privacyLink")}</span>
            <span className="mt-1 block text-xs text-muted">{t("about.privacyHint")}</span>
          </Link>
          <Link
            href={`/${locale}/consent`}
            className="rounded-2xl border border-night-line bg-night/60 p-4 transition-colors hover:border-accent/50"
          >
            <span className="block text-sm font-medium">{t("legal.consentLink")}</span>
            <span className="mt-1 block text-xs text-muted">{t("about.consentHint")}</span>
          </Link>
        </div>
        <div className="mt-3">
          <CookieSettingsButton
            label={t("legal.cookieSettings")}
            className="text-sm text-accent-ink hover:underline"
          />
        </div>
      </div>

      <div className="mt-9 rounded-2xl border border-night-line bg-night-soft/50 p-6">
        <h2 className="text-xl font-semibold tracking-tight">{t("about.contactTitle")}</h2>
        <p className="mt-3 text-sm leading-7 text-muted">{t("about.contactText")}</p>
        <a
          href={`mailto:${LEGAL.contactEmail}`}
          className="mt-2 inline-block text-sm font-medium text-accent-ink hover:underline"
        >
          {LEGAL.contactEmail}
        </a>
        <p className="mt-3 text-xs leading-6 text-muted">
          {locale === "en"
            ? `Operator: ${LEGAL.operator.legalLine.en}`
            : `Оператор: ${LEGAL.operator.legalLine.ru}`}
        </p>
      </div>
    </section>
  );
}
