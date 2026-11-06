import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { LegalDocumentView } from "@/components/legal/legal-document";
import { personalDataConsent } from "@/lib/legal/consent";
import { LEGAL } from "@/lib/legal/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  const lng = locale === "en" ? "en" : "ru";
  const doc = personalDataConsent[lng];
  return {
    title: `${doc.title} — ${t("brand")}`,
    description: doc.intro,
    alternates: {
      canonical: `${LEGAL.siteUrl}/${lng}/consent`,
      languages: {
        ru: `${LEGAL.siteUrl}/ru/consent`,
        en: `${LEGAL.siteUrl}/en/consent`,
        "x-default": `${LEGAL.siteUrl}/ru/consent`,
      },
    },
  };
}

export default async function ConsentPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { t } = await getServerTranslation(locale);

  return (
    <LegalDocumentView
      doc={personalDataConsent[locale]}
      backHref={`/${locale}/privacy`}
      labels={{
        updated: t("legal.updated"),
        version: t("legal.version"),
        contents: t("legal.contents"),
        back: t("legal.privacyLink"),
      }}
    />
  );
}
