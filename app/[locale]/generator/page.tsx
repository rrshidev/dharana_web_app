import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { requireAuth } from "@/lib/api/guard";
import { GeneratorApp } from "@/components/generator/generator-app";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return {
    title: `${t("generator.title")} — ${t("brand")}`,
    description: t("generator.metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function GeneratorPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireAuth(locale, `/${locale}/generator`);
  const { t } = await getServerTranslation(locale);

  return (
    <section className="py-4">
      <GeneratorApp
        locale={locale}
        labels={{
          title: t("generator.title"),
          subtitle: t("generator.subtitle"),
          difficulty: t("generator.difficulty"),
          duration: t("generator.duration"),
          focus: t("generator.focus"),
          noFocus: t("generator.noFocus"),
          difficulties: {
            beginner: t("generator.difficulties.beginner"),
            intermediate: t("generator.difficulties.intermediate"),
            advanced: t("generator.difficulties.advanced"),
          },
          durations: {
            "15": t("generator.durations.15"),
            "30": t("generator.durations.30"),
            "60": t("generator.durations.60"),
          },
          focuses: {
            back: t("generator.focuses.back"),
            legs: t("generator.focuses.legs"),
            balance: t("generator.focuses.balance"),
            flexibility: t("generator.focuses.flexibility"),
            energy: t("generator.focuses.energy"),
          },
          generate: t("generator.generate"),
          generating: t("generator.generating"),
          error: t("generator.error"),
          resultTitle: t("generator.resultTitle"),
          total: t("generator.total"),
          calories: t("generator.calories"),
          kcal: t("generator.kcal"),
          asanas: t("generator.asanas"),
          startPractice: t("generator.startPractice"),
          starting: t("generator.starting"),
          startError: t("generator.startError"),
          regenerate: t("generator.regenerate"),
          limitTitle: t("generator.limitTitle"),
          limitText: t("generator.limitText"),
          limitCta: t("generator.limitCta"),
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
            soundToggle: t("timer.soundToggle"),
            notifyAsana: t("timer.notifyAsana"),
            notifyRest: t("timer.notifyRest"),
            notifyComplete: t("timer.notifyComplete"),
          },
        }}
      />
    </section>
  );
}