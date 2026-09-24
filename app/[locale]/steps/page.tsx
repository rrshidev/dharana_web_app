import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { getSteps } from "@/lib/api/content";
import { ChevronRightIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const siteUrl = "https://dharana.ru";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return {
    title: `${t("steps.title")} — ${t("brand")}`,
    description: t("steps.metaDescription"),
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteUrl}/${locale}/steps`,
      languages: {
        ru: `${siteUrl}/ru/steps`,
        en: `${siteUrl}/en/steps`,
        "x-default": `${siteUrl}/ru/steps`,
      },
    },
  };
}

export default async function StepsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { t } = await getServerTranslation(locale);

  let items: Awaited<ReturnType<typeof getSteps>> = [];
  let loadError = false;
  try {
    items = await getSteps(locale);
  } catch {
    loadError = true;
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{t("steps.title")}</h1>
      <p className="mt-2 text-muted">{t("steps.subtitle")}</p>

      {loadError ? (
        <p className="mt-8 rounded-2xl border border-night-line p-8 text-center text-muted">
          {t("steps.listError")}
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {items.map((item, i) => {
            const displayName = locale === "en" && item.name_en ? item.name_en : item.name;
            return (
              <Link
                key={item.name}
                href={`/${locale}/steps/${encodeURIComponent(item.name)}`}
                className="flex items-center justify-between rounded-2xl border border-night-line bg-night/60 px-5 py-4 transition-colors hover:border-accent/50"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">{displayName}</span>
                </span>
                <ChevronRightIcon className="h-4 w-4 text-muted/60" />
              </Link>
            );
          })}
        </div>
      )}
    </article>
  );
}