import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { getSteps } from "@/lib/api/content";
import { normalizePathParam } from "@/lib/api/catalog";

export const dynamic = "force-dynamic";

const siteUrl = "https://dharana.ru";

type Props = { params: Promise<{ locale: string; name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, name: raw } = await params;
  const name = normalizePathParam(raw);
  const { t } = await getServerTranslation(locale);
  const items = await getSteps(locale);
  const item =
    items.find((i) => i.name === name) ??
    items.find((i) => i.name.toLowerCase() === name.toLowerCase());
  if (!item) {
    return {
      title: `${t("steps.itemNotFound")} — ${t("brand")}`,
      robots: { index: false, follow: false },
    };
  }
  const displayName =
    locale === "en" && item.name_en ? item.name_en : item.name;
  const path = `steps/${encodeURIComponent(item.name)}`;
  return {
    title: `${displayName} — ${t("steps.title")} — ${t("brand")}`,
    description: item.content?.slice(0, 160) || t("steps.itemNotFound"),
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteUrl}/${locale}/${path}`,
      languages: {
        ru: `${siteUrl}/ru/${path}`,
        en: `${siteUrl}/en/${path}`,
        "x-default": `${siteUrl}/ru/${path}`,
      },
    },
  };
}

export default async function StepItemPage({ params }: Props) {
  const { locale, name: rawName } = await params;
  const name = normalizePathParam(rawName);
  if (!isLocale(locale)) notFound();

  const { t } = await getServerTranslation(locale);

  const items = await getSteps(locale);
  const item =
    items.find((i) => i.name === name) ??
    items.find((i) => i.name.toLowerCase() === name.toLowerCase());

  if (!item) notFound();
  if (item.name !== name) {
    permanentRedirect(`/${locale}/steps/${encodeURIComponent(item.name)}`);
  }

  const displayName = locale === "en" && item.name_en ? item.name_en : item.name;

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href={`/${locale}/steps`}
        className="mb-6 inline-block text-sm text-muted transition-colors hover:text-ink"
      >
        {t("steps.backToList")}
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight">{displayName}</h1>

      <div className="mt-6 whitespace-pre-line leading-relaxed text-muted">
        {item.content}
      </div>
    </article>
  );
}