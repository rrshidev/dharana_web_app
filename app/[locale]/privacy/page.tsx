import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { LegalDocumentView } from "@/components/legal/legal-document";
import { privacyPolicy } from "@/lib/legal/privacy";
import { LEGAL } from "@/lib/legal/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  const lng = locale === "en" ? "en" : "ru";
  const doc = privacyPolicy[lng];
  return {
    title: `${doc.title} — ${t("brand")}`,
    description: doc.intro,
    alternates: {
      canonical: `${LEGAL.siteUrl}/${lng}/privacy`,
      languages: {
        ru: `${LEGAL.siteUrl}/ru/privacy`,
        en: `${LEGAL.siteUrl}/en/privacy`,
        "x-default": `${LEGAL.siteUrl}/ru/privacy`,
      },
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { t } = await getServerTranslation(locale);

  return (
    <LegalDocumentView
      doc={privacyPolicy[locale]}
      backHref={`/${locale}`}
      labels={{
        updated: t("legal.updated"),
        version: t("legal.version"),
        contents: t("legal.contents"),
        back: t("legal.backHome"),
      }}
    />
  );
}
