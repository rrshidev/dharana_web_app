import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import {
  getAsanaDetail,
  getAsanaVideo,
  getAsanaVideoNames,
  normalizePathParam,
  type AsanaVideoInfo,
} from "@/lib/api/catalog";
import { checkFavorite } from "@/lib/api/user";
import { mediaUrl, AUTH_COOKIE } from "@/lib/api/media";
import { AsanaPhoto } from "@/components/asana/asana-photo";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { FavoriteGate } from "@/components/favorites/favorite-gate";
import { SparkleIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const siteUrl = "https://dharana.ru";

type Props = { params: Promise<{ locale: string; name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, name } = await params;
  const { t } = await getServerTranslation(locale);
  const asanaName = normalizePathParam(name);
  const asana = await getAsanaDetail(asanaName, locale).catch(() => null);
  const displayName =
    locale === "en"
      ? asana?.name_en || asana?.name || asanaName
      : asana?.name_ru || asana?.name || asanaName;
  const path = `asana/${encodeURIComponent(asanaName)}`;
  return {
    title: `${displayName} — ${t("catalog.title")} — ${t("brand")}`,
    description:
      asana?.description?.slice(0, 160) || t("asana.noDescription"),
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

export default async function AsanaPage({ params }: Props) {
  const { locale, name: rawName } = await params;
  const name = normalizePathParam(rawName);
  if (!isLocale(locale)) notFound();

  const { t } = await getServerTranslation(locale);

  const cookieStore = await cookies();
  const hasToken = Boolean(cookieStore.get(AUTH_COOKIE)?.value);

  let asana: Awaited<ReturnType<typeof getAsanaDetail>>;
  let isFavorite = false;
  try {
    asana = await getAsanaDetail(name, locale);
  } catch {
    asana = null;
  }

  if (hasToken) {
    try {
      isFavorite = await checkFavorite(name);
    } catch {
      // без доступа к профилю показываем сердечко как есть
    }
  }

  let video: AsanaVideoInfo | null = null;
  let guestHasVideo = false;
  if (hasToken) {
    video = await getAsanaVideo(name).catch(() => null);
  } else {
    const videoNames = await getAsanaVideoNames();
    guestHasVideo = videoNames.includes(name);
  }

  const img = mediaUrl(asana?.image_url ?? null);
  const displayName =
    locale === "en"
      ? asana?.name_en || asana?.name || name
      : asana?.name_ru || asana?.name || name;

  const asanaUrl = `${siteUrl}/${locale}/asana/${encodeURIComponent(name)}`;
  const ldJson = asana
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("brand"), item: `${siteUrl}/${locale}` },
              {
                "@type": "ListItem",
                position: 2,
                name: t("catalog.title"),
                item: `${siteUrl}/${locale}/catalog`,
              },
              { "@type": "ListItem", position: 3, name: displayName },
            ],
          },
          {
            "@type": "ExercisePlan",
            name: displayName,
            description: asana.description || t("asana.noDescription"),
            url: asanaUrl,
            image: img ?? undefined,
            keywords: asana.effects.length ? asana.effects.join(", ") : undefined,
          },
        ],
      }
    : null;

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {ldJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
      )}

      <Link
        href={`/${locale}/catalog`}
        className="mb-6 inline-block text-sm text-muted transition-colors hover:text-ink"
      >
        {t("asana.backToCatalog")}
      </Link>

      {!asana ? (
        <p className="rounded-2xl border border-night-line p-8 text-center text-muted">
          {t("asana.notFound")}
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          <AsanaPhoto src={img} alt={displayName} />

          {(video || guestHasVideo) && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {t("asana.video")}
              </h2>
              {video?.accessible && video.video_url ? (
                <video
                  src={mediaUrl(video.video_url) ?? undefined}
                  controls
                  preload="metadata"
                  playsInline
                  className="aspect-video w-full rounded-2xl border border-night-line bg-night"
                />
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-night-line bg-night-soft/40 text-center">
                  <SparkleIcon className="h-10 w-10 text-accent/70" />
                  <p className="mt-4 px-6 text-sm font-medium">{t("asana.videoPremium")}</p>
                  <Link
                    href={`/${locale}/profile/subscription`}
                    className="mt-4 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-night transition-opacity hover:opacity-90"
                  >
                    {t("asana.videoCta")}
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{displayName}</h1>
                <p className="mt-1 text-sm text-muted">{asana.category_name}</p>
              </div>
              {hasToken ? (
                <FavoriteButton
                  name={asana.name}
                  initial={isFavorite}
                  size="lg"
                  labels={{
                    add: t("asana.addToFavorites"),
                    remove: t("asana.removeFromFavorites"),
                  }}
                />
              ) : (
                <FavoriteGate
                  locale={locale}
                  next={`/${locale}/asana/${asana.name}`}
                  labels={{
                    title: t("favorites.gateTitle"),
                    text: t("favorites.gateText"),
                    login: t("favorites.gateLogin"),
                    register: t("favorites.gateRegister"),
                  }}
                  size="lg"
                />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">{t("asana.difficulty")}:</span>
                <span className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-1.5 w-6 rounded-full ${
                        n <= asana.difficulty ? "bg-accent" : "bg-night-line"
                      }`}
                    />
                  ))}
                </span>
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {t("asana.description")}
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-muted">
                {asana.description || t("asana.noDescription")}
              </p>
            </div>

            {asana.effects.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                  {t("asana.effects")}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {asana.effects.map((e) => (
                    <li
                      key={e}
                      className="rounded-full border border-night-line px-3 py-1 text-xs text-muted"
                    >
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {asana.contraindications.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                  {t("asana.contraindications")}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {asana.contraindications.map((c) => (
                    <li
                      key={c}
                      className="rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1 text-xs text-red-400"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}