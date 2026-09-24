import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { getBasics } from "@/lib/api/content";
import { ChevronRightIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const siteUrl = "https://dharana.ru";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return {
    title: `${t("basics.title")} — ${t("brand")}`,
    description: t("basics.metaDescription"),
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteUrl}/${locale}/basics`,
      languages: {
        ru: `${siteUrl}/ru/basics`,
        en: `${siteUrl}/en/basics`,
        "x-default": `${siteUrl}/ru/basics`,
      },
    },
  };
}

export default async function BasicsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { t } = await getServerTranslation(locale);

  let items: Awaited<ReturnType<typeof getBasics>> = [];
  let loadError = false;
  try {
    items = await getBasics(locale);
  } catch {
    loadError = true;
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{t("basics.title")}</h1>
      <p className="mt-2 text-muted">{t("basics.subtitle")}</p>

      {loadError ? (
        <p className="mt-8 rounded-2xl border border-night-line p-8 text-center text-muted">
          {t("basics.listError")}
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {items.map((item) => {
            const displayName = locale === "en" && item.name_en ? item.name_en : item.name;
            return (
              <Link
                key={item.name}
                href={`/${locale}/basics/${encodeURIComponent(item.name)}`}
                className="flex items-center justify-between rounded-2xl border border-night-line bg-night/60 px-5 py-4 transition-colors hover:border-accent/50"
              >
                <span className="text-sm font-medium">{displayName}</span>
                <ChevronRightIcon className="h-4 w-4 text-muted/60" />
              </Link>
            );
          })}
        </div>
      )}
    </article>
  );
}