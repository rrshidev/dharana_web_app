import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { MAX_BOT_URL } from "@/lib/constants";
import {
  MaxMiniApp,
  type MaxMiniAppLabels,
} from "@/components/max/mini-app-login";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dharana",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ locale: string }> };

/**
 * Мини-приложение MAX для подтверждения входа.
 *
 * URL этой страницы указывается в карточке бота на платформе MAX
 * (https://dharana.ru/ru/max/login). Открывается только внутри мессенджера:
 * MAX Bridge отдаёт подписанный initData, без него страница бесполезна.
 */
export default async function MaxLoginPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { t } = await getServerTranslation(locale);

  const labels: MaxMiniAppLabels = {
    confirming: t("max.confirming"),
    success: t("max.success"),
    already: t("max.already"),
    error: t("max.error"),
    notInMax: t("max.notInMax"),
    openBot: t("max.openBot"),
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight">
        {t("brand")}
      </h1>
      <MaxMiniApp botUrl={MAX_BOT_URL} labels={labels} />
      <Script src="https://st.max.ru/js/max-web-app.js" strategy="afterInteractive" />
    </section>
  );
}
