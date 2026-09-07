import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { requireAuth } from "@/lib/api/guard";
import { getAsanas, getCategories, type Category } from "@/lib/api/catalog";
import { getActiveSession, type ActiveSession } from "@/lib/api/timer";
import { TimerApp } from "@/components/timer/timer-app";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return { title: `${t("timer.title")} — ${t("brand")}`, robots: { index: false, follow: false } };
}

function categoryLabel(t: (k: string) => string, cat: Category): string {
  const key = `categories.${cat.id}`;
  const translated = t(key);
  return translated === key ? cat.display_name : translated;
}

export default async function TimerPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireAuth(locale, `/${locale}/timer`);
  const { t } = await getServerTranslation(locale);

  let categories: Category[] = [];
  let list = { total: 0, items: [] as Awaited<ReturnType<typeof getAsanas>>["items"] };
  let activeSession: ActiveSession | null = null;
  let failed = false;

  try {
    [categories, list, activeSession] = await Promise.all([
      getCategories(),
      getAsanas({ limit: 200 }),
      getActiveSession().catch(() => null),
    ]);
  } catch {
    failed = true;
  }

  const categoryName = (categoryId: string): string => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? categoryLabel(t, cat) : "";
  };

  if (failed) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-12">
        <p className="rounded-2xl border border-night-line p-8 text-center text-muted">
          {t("catalog.listError")}
        </p>
      </section>
    );
  }

  let resumeText = "";
  if (activeSession?.active && activeSession.started_at) {
    const started = new Date(activeSession.started_at).toLocaleTimeString(
      locale === "ru" ? "ru-RU" : "en-US",
      { hour: "2-digit", minute: "2-digit" },
    );
    resumeText = t("timer.resumeText", { time: started });
  }

  return (
    <section className="py-4">
      <TimerApp
        asanas={list.items.map((a) => ({
          name: a.name,
          image_url: a.image_url,
          categoryLabel: categoryName(a.category_id),
        }))}
        activeSession={activeSession}
        labels={{
          title: t("timer.title"),
          defaultTime: t("timer.defaultTime"),
          asanaLabel: t("timer.asanaLabel"),
          restLabel: t("timer.restLabel"),
          selectedTitle: t("timer.selectedTitle"),
          availableTitle: t("timer.availableTitle"),
          addHint: t("timer.addHint"),
          start: t("timer.start"),
          stopError: t("timer.stopError"),
          startError: t("timer.startError"),
          moveUp: t("timer.moveUp"),
          moveDown: t("timer.moveDown"),
          remove: t("timer.remove"),
          durationCombine: t("timer.durationCombine"),
          restCombine: t("timer.restCombine"),
          resumeTitle: t("timer.resumeTitle"),
          resumeText: resumeText,
          resumeAction: t("timer.resumeAction"),
          resumeError: t("timer.resumeError"),
          screen: {
            title: t("timer.title"),
            ready: t("timer.ready"),
            modeAsana: t("timer.modeAsana"),
            modeRest: t("timer.modeRest"),
            modeCompensation: t("timer.modeCompensation"),
            modePaused: t("timer.modePaused"),
            start: t("timer.startRun"),
            reset: t("timer.reset"),
            pause: t("timer.pause"),
            resume: t("timer.resume"),
            next: t("timer.next"),
            stop: t("timer.stop"),
            completeTitle: t("timer.completeTitle"),
            completeCount: t("timer.completeCount"),
            completeDuration: t("timer.completeDuration"),
            again: t("timer.again"),
            close: t("timer.close"),
            indexOf: t("timer.indexOf"),
          },
        }}
      />
    </section>
  );
}