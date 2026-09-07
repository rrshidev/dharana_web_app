import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { getCategories, getAsanaDetail, type Category, type AsanaDetail } from "@/lib/api/catalog";
import { getFavoriteNames } from "@/lib/api/user";
import { requireAuth } from "@/lib/api/guard";
import { AsanaCard } from "@/components/catalog/asana-card";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { HeartFilledIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return {
    title: `${t("favorites.title")} — ${t("brand")}`,
    robots: { index: false, follow: false },
  };
}

function categoryLabel(t: (k: string) => string, cat: { id: string; display_name: string }): string {
  const key = `categories.${cat.id}`;
  const translated = t(key);
  return translated === key ? cat.display_name : translated;
}

export default async function FavoritesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireAuth(locale, `/${locale}/favorites`);
  const { t } = await getServerTranslation(locale);

  let names: string[] = [];
  let categories: Category[] = [];
  let favorites: Array<{ order: number; asana: AsanaDetail }> = [];
  let error = false;

  try {
    [names, categories] = await Promise.all([getFavoriteNames(), getCategories()]);
    const details = await Promise.all(names.map((name) => getAsanaDetail(name)));
    favorites = details
      .map((asana, order) => ({ order, asana }))
      .filter((f): f is { order: number; asana: NonNullable<typeof f.asana> } => Boolean(f.asana))
      .sort((a, b) => a.order - b.order);
  } catch {
    error = true;
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{t("favorites.title")}</h1>
        {!error && favorites.length > 0 && <p className="text-sm text-muted">{favorites.length}</p>}
      </div>

      {error ? (
        <p className="rounded-2xl border border-night-line p-8 text-center text-muted">
          {t("catalog.listError")}
        </p>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-night-line px-6 py-16 text-center">
          <span className="text-muted/30">
            <HeartFilledIcon className="h-16 w-16" />
          </span>
          <h2 className="mt-6 text-xl font-semibold">{t("favorites.empty")}</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{t("favorites.emptyHint")}</p>
          <Link
            href={`/${locale}/catalog`}
            className="mt-8 h-11 rounded-full bg-accent px-6 text-sm font-semibold text-night transition-opacity hover:opacity-90 inline-flex items-center"
          >
            {t("favorites.catalogCta")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map(({ asana }) => {
            const cat = categories.find((c) => c.id === asana.category_id);
            return (
              <AsanaCard
                key={asana.name}
                locale={locale}
                asana={asana}
                categoryLabel={categoryLabel(t, cat ?? { id: asana.category_id, display_name: "" })}
                difficultyLabel={t("asana.difficulty")}
                favoriteButton={
                  <FavoriteButton
                    name={asana.name}
                    initial
                    labels={{
                      add: t("asana.addToFavorites"),
                      remove: t("asana.removeFromFavorites"),
                    }}
                  />
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}