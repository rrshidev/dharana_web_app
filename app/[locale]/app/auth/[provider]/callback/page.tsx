import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

/**
 * Колбэк OAuth для приложения Android приходит сюда только если приложение НЕ
 * установлено — иначе ОС открывает App Link прямо в приложение, минуя веб.
 * Показываем понятную страницу вместо 404.
 */
type Props = {
  params: Promise<{ locale: string; provider: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(isLocale(locale) ? locale : "ru");
  return { title: `${t("appAuthCallback.title")} — ${t("brand")}`, robots: { index: false } };
}

export default async function AppAuthCallbackPage({ params }: Props) {
  const { locale, provider } = await params;
  if (!isLocale(locale)) notFound();
  const { t } = await getServerTranslation(locale);

  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent-ink">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
          <path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
          <path d="M11 18h2" />
        </svg>
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">{t("appAuthCallback.title")}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{t("appAuthCallback.text")}</p>
      <Link
        href={`/${locale}/login`}
        className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-sage px-6 text-sm font-semibold text-sage-on transition-colors hover:bg-sage/90"
      >
        {t("appAuthCallback.toLogin")}
      </Link>
      <p className="mt-4 text-xs text-muted">{provider}</p>
    </section>
  );
}