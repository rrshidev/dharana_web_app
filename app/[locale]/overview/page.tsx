import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { requireAuth } from "@/lib/api/guard";
import {
  getCategories,
  getRandomAsana,
  type Category,
  type AsanaDetail,
} from "@/lib/api/catalog";
import { getProfile } from "@/lib/api/user";
import { AsanaCard } from "@/components/catalog/asana-card";
import { Greeting } from "@/components/overview/greeting";
import { GridIcon, FilmIcon, FilterIcon, ChevronRightIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return { title: `${t("overview.title")} — ${t("brand")}`, robots: { index: false, follow: false } };
}

function categoryLabel(t: (k: string) => string, cat: { id: string; display_name: string }): string {
  const key = `categories.${cat.id}`;
  const translated = t(key);
  return translated === key ? cat.display_name : translated;
}

export default async function OverviewPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireAuth(locale, `/${locale}/overview`);
  const { t } = await getServerTranslation(locale);

  let categories: Category[] = [];
  let daily: AsanaDetail | null = null;
  let userName: string | null = null;

  try {
    [categories, daily, userName] = await Promise.all([
      getCategories(),
      getRandomAsana(),
      getProfile()
        .then((p) => p.name)
        .catch(() => null),
    ]);
  } catch {
    // fail open — render whatever loaded
  }

  const quick = [
    { href: `/${locale}/catalog`, icon: GridIcon, label: t("catalog.title") },
    { href: `/${locale}/complexes`, icon: FilmIcon, label: t("complexes.title") },
    { href: `/${locale}/filter`, icon: FilterIcon, label: t("filter.title") },
  ];

  const dailyCat = daily ? categories.find((c) => c.id === daily.category_id) : undefined;

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <Greeting
        userName={userName}
        labels={{
          night: t("overview.greetingNight"),
          morning: t("overview.greetingMorning"),
          day: t("overview.greetingDay"),
          evening: t("overview.greetingEvening"),
          yogi: t("overview.yogi"),
        }}
      />
      <p className="mt-1 text-sm text-muted">{t("overview.subtitle")}</p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {quick.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-night-line bg-night/60 px-2 py-5 text-center transition-colors hover:border-accent/50"
          >
            <q.icon className="h-6 w-6 text-accent" />
            <span className="text-sm font-medium">{q.label}</span>
          </Link>
        ))}
      </div>

      {daily && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">{t("overview.asanaOfDay")}</h2>
          <div className="mt-4">
            <AsanaCard
              locale={locale}
              asana={daily}
              categoryLabel={dailyCat ? categoryLabel(t, dailyCat) : daily.category_name}
              difficultyLabel={t("asana.difficulty")}
            />
          </div>
        </div>
      )}

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{t("overview.categories")}</h2>
          <Link
            href={`/${locale}/catalog`}
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink"
          >
            {t("overview.allCatalog")}
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${locale}/catalog?category=${encodeURIComponent(cat.id)}`}
              className="flex items-center justify-between rounded-2xl border border-night-line bg-night/60 px-4 py-4 transition-colors hover:border-accent/50"
            >
              <span>
                <span className="block text-sm font-medium">{categoryLabel(t, cat)}</span>
                <span className="mt-0.5 block text-xs text-muted">{cat.asana_count}</span>
              </span>
              <ChevronRightIcon className="h-4 w-4 text-muted/60" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}