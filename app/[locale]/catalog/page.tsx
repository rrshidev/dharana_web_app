import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { getCategories, getAsanas, type Category } from "@/lib/api/catalog";
import { requireAuth } from "@/lib/api/guard";
import { AsanaCard } from "@/components/catalog/asana-card";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; search?: string; difficulty?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return { title: `${t("catalog.title")} — ${t("brand")}` };
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

  const spQuery = new URLSearchParams();
  if (category) spQuery.set("category", category);
  if (search) spQuery.set("search", search);
  if (difficulty) spQuery.set("difficulty", String(difficulty));
  const qs = spQuery.toString();
  await requireAuth(locale, `/${locale}/catalog${qs ? `?${qs}` : ""}`);

  const { t } = await getServerTranslation(locale);

  let categories: Category[] = [];
  let listError = false;
  let list = { total: 0, items: [] as Awaited<ReturnType<typeof getAsanas>>["items"] };

  try {
    [categories, list] = await Promise.all([
      getCategories(),
      getAsanas({ category, difficulty, search, limit: 48 }),
    ]);
  } catch {
    listError = true;
  }

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

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
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
                asana={asana}
                categoryLabel={categoryLabel(t, cat ?? { id: asana.category_id, display_name: "" })}
                difficultyLabel={t("asana.difficulty")}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}