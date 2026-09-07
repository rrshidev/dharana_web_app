import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { requireAuth } from "@/lib/api/guard";
import { getSequenceVideos, type SequenceVideo } from "@/lib/api/timer";
import { API_URL } from "@/lib/constants";
import { FilmIcon, SparkleIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return { title: `${t("complexes.title")} — ${t("brand")}`, robots: { index: false, follow: false } };
}

export default async function ComplexesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireAuth(locale, `/${locale}/complexes`);
  const { t } = await getServerTranslation(locale);

  let videos: SequenceVideo[] = [];
  let error = false;
  try {
    videos = await getSequenceVideos();
  } catch {
    error = true;
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{t("complexes.title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("complexes.subtitle")}</p>

      {error ? (
        <p className="mt-8 rounded-2xl border border-night-line p-8 text-center text-muted">
          {t("catalog.listError")}
        </p>
      ) : videos.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-night-line px-6 py-16 text-center">
          <FilmIcon className="h-10 w-10 text-muted/40" />
          <p className="mt-4 text-lg font-semibold">{t("complexes.empty")}</p>
          <p className="mt-1 text-sm text-muted">{t("complexes.emptyHint")}</p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {videos.map((video) => (
            <article
              key={video.id}
              className="overflow-hidden rounded-2xl border border-night-line bg-night/60"
            >
              <div className="aspect-video w-full bg-night">
                {video.video_url ? (
                  <video
                    src={`${API_URL}${video.video_url}`}
                    controls
                    preload="metadata"
                    playsInline
                    className="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-night-soft/40 text-center">
                    <SparkleIcon className="h-10 w-10 text-accent/70" />
                    <p className="mt-4 px-6 text-sm font-medium">{t("complexes.premiumLocked")}</p>
                    <Link
                      href={`/${locale}/profile/subscription`}
                      className="mt-4 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-night transition-opacity hover:opacity-90"
                    >
                      {t("complexes.getPremium")}
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <h2 className="text-base font-semibold leading-snug">{video.name}</h2>
                {video.is_premium && (
                  <span className="shrink-0 rounded-full bg-accent/15 px-3 py-1 text-[11px] font-semibold text-accent">
                    Premium
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}