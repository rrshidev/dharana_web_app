import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { requireAuth } from "@/lib/api/guard";
import { getCategories, getAsanas, type Category } from "@/lib/api/catalog";
import { AsanaCard } from "@/components/catalog/asana-card";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; difficulty?: string; effect?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return { title: `${t("filter.title")} — ${t("brand")}`, robots: { index: false, follow: false } };
}

const EFFECTS = [
  "back_pain",
  "calm_mind",
  "boost_energy",
  "digestion",
  "flexibility",
  "balance",
  "strength",
  "stress_relief",
  "strength_abs",
  "knees",
  "neck_pain",
  "circulation",
  "lungs",
  "weight_loss",
];

const DIFFICULTIES = ["1", "2", "3"];

export default async function FilterPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const sp = await searchParams;
  const category = sp.category || undefined;
  const difficulty = sp.difficulty ? Number(sp.difficulty) : undefined;
  const effect = sp.effect || undefined;

  const spQuery = new URLSearchParams();
  if (category) spQuery.set("category", category);
  if (difficulty) spQuery.set("difficulty", String(difficulty));
  if (effect) spQuery.set("effect", effect);
  const nextPath = `/${locale}/filter${spQuery.size ? `?${spQuery}` : ""}`;
  await requireAuth(locale, nextPath);

  const { t } = await getServerTranslation(locale);

  let categories: Category[] = [];
  let list = { total: 0, items: [] as Awaited<ReturnType<typeof getAsanas>>["items"] };
  let error = false;

  try {
    [categories, list] = await Promise.all([
      getCategories(),
      getAsanas({ category, difficulty, effect, limit: 50 }),
    ]);
  } catch {
    error = true;
  }

  const hasFilter = Boolean(category || difficulty || effect);

  const toggleHref = (key: string, value: string | undefined) => {
    const current: Record<string, string> = {};
    if (category) current.category = category;
    if (difficulty) current.difficulty = String(difficulty);
    if (effect) current.effect = effect;
    if (value === undefined) {
      delete current[key];
    } else {
      current[key] = current[key] === value ? "" : value;
    }
    const next = new URLSearchParams(current);
    const qs = next.toString();
    return `/${locale}/filter${qs ? `?${qs}` : ""}`;
  };

  const chip = (
    key: string,
    value: string,
    active: boolean,
    label: string,
  ) => (
    <Link
      href={toggleHref(key, value)}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-night-line text-muted hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );

  const categoryLabel = (cat: Category): string => {
    const key = `categories.${cat.id}`;
    const translated = t(key);
    return translated === key ? cat.display_name : translated;
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{t("filter.title")}</h1>
        {hasFilter && (
          <Link href={`/${locale}/filter`} className="text-sm text-muted transition-colors hover:text-ink">
            {t("filter.reset")}
          </Link>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t("filter.goal")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {EFFECTS.map((e) =>
              chip("effect", e, effect === e, t(`filter.effects.${e}`)),
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t("filter.level")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) =>
              chip("difficulty", d, difficulty === Number(d), t(`filter.levels.${d}`)),
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t("filter.position")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((cat) =>
              chip("category", cat.id, category === cat.id, categoryLabel(cat)),
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-night-line pt-6">
        {error ? (
          <p className="rounded-2xl border border-night-line p-8 text-center text-muted">
            {t("catalog.listError")}
          </p>
        ) : !hasFilter ? (
          <p className="rounded-2xl border border-dashed border-night-line p-10 text-center text-sm text-muted">
            {t("filter.pickHint")}
          </p>
        ) : list.items.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-night-line px-6 py-14 text-center">
            <p className="text-3xl">🔍</p>
            <p className="mt-3 text-base font-semibold">{t("filter.none")}</p>
            <p className="mt-1 text-sm text-muted">{t("filter.noneHint")}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted">{list.total}</p>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.items.map((asana) => {
                const cat = categories.find((c) => c.id === asana.category_id);
                return (
                  <AsanaCard
                    key={asana.name}
                    locale={locale}
                    asana={asana}
                    categoryLabel={
                      cat ? categoryLabel(cat) : asana.category_id
                    }
                    difficultyLabel={t("asana.difficulty")}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}