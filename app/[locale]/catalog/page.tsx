import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { getCategories, getAsanas, getAsanaVideoNames, type Category } from "@/lib/api/catalog";
import { getFavoriteNames } from "@/lib/api/user";
import { AUTH_COOKIE } from "@/lib/api/media";
import { AsanaCard } from "@/components/catalog/asana-card";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { FavoriteGate } from "@/components/favorites/favorite-gate";

export const dynamic = "force-dynamic";

const siteUrl = "https://dharana.ru";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; search?: string; difficulty?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  const sp = await searchParams;
  const hasFilters = Boolean(sp.category || sp.search || sp.difficulty);
  return {
    title: `${t("catalog.title")} — ${t("brand")}`,
    description: t("catalog.metaDescription"),
    robots: hasFilters
      ? { index: false, follow: true }
      : { index: true, follow: true },
    alternates: hasFilters
      ? undefined
      : { canonical: `${siteUrl}/${locale}/catalog` },
  };
}

function categoryLabel(t: (k: string) => string, cat: { id: string; display_name: string }): string {
  const key = `categories.${cat.id}`;
  const translated = t(key);
  return translated === key ? cat.display_name : translated;
}

export default async function CatalogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const sp = await searchParams;
  const category = sp.category || undefined;
  const search = sp.search || undefined;
  const difficulty = sp.difficulty ? Number(sp.difficulty) : undefined;

  const spQuery: string[] = [];
  if (category) spQuery.push(`category=${category}`);
  if (search) spQuery.push(`search=${search}`);
  if (difficulty) spQuery.push(`difficulty=${difficulty}`);
  const nextPath = `/${locale}/catalog${spQuery.length ? `?${spQuery.join("&")}` : ""}`;

  const { t } = await getServerTranslation(locale);

  const cookieStore = await cookies();
  const hasToken = Boolean(cookieStore.get(AUTH_COOKIE)?.value);

  let categories: Category[] = [];
  let listError = false;
  let favorites: string[] = [];
  let list = { total: 0, items: [] as Awaited<ReturnType<typeof getAsanas>>["items"] };

  try {
    [categories, list] = await Promise.all([
      getCategories(),
      getAsanas({ category, difficulty, search, limit: 48 }),
    ]);
  } catch {
    listError = true;
  }

  if (hasToken) {
    try {
      favorites = await getFavoriteNames();
    } catch {
      // нет доступа к избранному — показываем каталог без следов авторизации
    }
  }

  const videoNames = await getAsanaVideoNames();

  const chipHref = (catId: string | undefined) => {
    const next = catId === category ? undefined : catId;
    const sp2 = new URLSearchParams();
    if (search) sp2.set("search", search);
    if (difficulty) sp2.set("difficulty", String(difficulty));
    if (next) sp2.set("category", next);
    const qs = sp2.toString();
    return `/${locale}/catalog${qs ? `?${qs}` : ""}`;
  };

  const hasFilters = Boolean(category || search || difficulty);

  const gateLabels = {
    title: t("favorites.gateTitle"),
    text: t("favorites.gateText"),
    login: t("favorites.gateLogin"),
    register: t("favorites.gateRegister"),
  };

  const itemListLd =
    !listError && !hasFilters
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: t("catalog.title"),
          itemListElement: list.items.map((asana, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Thing",
              name: asana.name,
              url: `${siteUrl}/${locale}/asana/${encodeURIComponent(asana.name)}`,
            },
          })),
        }
      : null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      {itemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      )}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{t("catalog.title")}</h1>
        <p className="text-sm text-muted">{list.total}</p>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-wide text-muted">
            {t("catalog.filter")}
          </span>
          <Link
            href={chipHref(undefined)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              !category
                ? "border-accent bg-accent/10 text-accent"
                : "border-night-line text-muted hover:text-ink"
            }`}
          >
            {t("catalog.all")}
          </Link>
          {categories.map((cat) => {
            const active = cat.id === category;
            return (
              <Link
                key={cat.id}
                href={chipHref(cat.id)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-night-line text-muted hover:text-ink"
                }`}
              >
                {categoryLabel(t, cat)} · {cat.asana_count}
              </Link>
            );
          })}
        </div>

        <form
          action={`/${locale}/catalog`}
          method="get"
          className="flex max-w-md items-center gap-2"
        >
          <input
            type="hidden"
            name="category"
            value={category ?? ""}
          />
          <input
            type="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder={t("catalog.searchPlaceholder")}
            className="flex-1 rounded-lg border border-night-line bg-night px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-night transition-opacity hover:opacity-90"
          >
            {t("catalog.search")}
          </button>
          {hasFilters && (
            <Link
              href={`/${locale}/catalog`}
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              {t("catalog.reset")}
            </Link>
          )}
        </form>
      </div>

      {listError ? (
        <p className="rounded-2xl border border-night-line p-8 text-center text-muted">
          {t("catalog.listError")}
        </p>
      ) : list.items.length === 0 ? (
        <p className="rounded-2xl border border-night-line p-8 text-center text-muted">
          {t("catalog.none")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.items.map((asana) => {
            const cat = categories.find((c) => c.id === asana.category_id);
            return (
              <AsanaCard
                key={asana.name}
                locale={locale}
                asana={{ ...asana, has_video: videoNames.includes(asana.name) }}
                categoryLabel={categoryLabel(t, cat ?? { id: asana.category_id, display_name: "" })}
                difficultyLabel={t("asana.difficulty")}
                videoLabel={t("asana.video")}
                favoriteButton={
                  hasToken ? (
                    <FavoriteButton
                      name={asana.name}
                      initial={favorites.includes(asana.name)}
                      labels={{
                        add: t("asana.addToFavorites"),
                        remove: t("asana.removeFromFavorites"),
                      }}
                    />
                  ) : (
                    <FavoriteGate locale={locale} next={nextPath} labels={gateLabels} />
                  )
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}