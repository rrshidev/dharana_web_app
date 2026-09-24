import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { getSteps, type TheoryItem } from "@/lib/api/content";
import { normalizePathParam } from "@/lib/api/catalog";

export const dynamic = "force-dynamic";

const siteUrl = "https://dharana.ru";

type Props = { params: Promise<{ locale: string; name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, name: raw } = await params;
  const name = normalizePathParam(raw);
  const { t } = await getServerTranslation(locale);
  const item = (await getSteps(locale).catch(() => [] as TheoryItem[])).find(
    (i) => i.name === name,
  );
  const displayName = item
    ? locale === "en" && item.name_en
      ? item.name_en
      : item.name
    : name;
  return {
    title: `${displayName} — ${t("steps.title")} — ${t("brand")}`,
    description: item?.content?.slice(0, 160) || t("steps.itemNotFound"),
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteUrl}/${locale}/steps/${encodeURIComponent(name)}`,
      languages: {
        ru: `${siteUrl}/ru/steps/${encodeURIComponent(name)}`,
        en: `${siteUrl}/en/steps/${encodeURIComponent(name)}`,
        "x-default": `${siteUrl}/ru/steps/${encodeURIComponent(name)}`,
      },
    },
  };
}

export default async function StepItemPage({ params }: Props) {
  const { locale, name: rawName } = await params;
  const name = normalizePathParam(rawName);
  if (!isLocale(locale)) notFound();

  const { t } = await getServerTranslation(locale);

  let item: TheoryItem | undefined;
  try {
    item = (await getSteps(locale)).find((i) => i.name === name);
  } catch {
    item = undefined;
  }

  if (!item) {
    return (
      <article className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href={`/${locale}/steps`}
          className="mb-6 inline-block text-sm text-muted transition-colors hover:text-ink"
        >
          {t("steps.backToList")}
        </Link>
        <p className="rounded-2xl border border-night-line p-8 text-center text-muted">
          {t("steps.itemNotFound")}
        </p>
      </article>
    );
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