import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { APK_URL, TELEGRAM_BOT_URL } from "@/lib/constants";
import { SocialIcon } from "@/components/brand/social-icon";
import { SocialLink } from "@/components/brand/social-button";
import HeroVideo from "@/components/landing/hero-video";

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6 9.5A1.5 1.5 0 0 1 7.5 8h9A1.5 1.5 0 0 1 18 9.5v6a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 15.5v-6zm3-6.1l1.2-1.4a.5.5 0 0 1 .7-.1l1 1.2a5.3 5.3 0 0 1 2.2 0l1-1.2a.5.5 0 0 1 .7.1L17 3.4a4 4 0 0 1 1.6 2.1h-12A4 4 0 0 1 9 3.4zm-.9 1.3a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6zm7.8 0a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6zm-8.8 4.1h9.8v6h-9.8v-6zM7.5 19h1v2a1 1 0 1 1-2 0v-2zm9 0h1v2a1 1 0 1 1-2 0v-2z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);

  return {
    title: `${t("hero.eyebrow")} — ${t("brand")}`,
    description: t("hero.subtitle"),
    alternates: {
      canonical: locale === "ru" ? "https://dharana.ru/ru" : "https://dharana.ru/en",
      languages: {
        ru: "https://dharana.ru/ru",
        en: "https://dharana.ru/en",
      },
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { t } = await getServerTranslation(locale);

  const features = t("features.items", { returnObjects: true }) as Array<
    { title: string; route: string; text: string }
  >;

  return (
    <div className="overflow-hidden">
      <section className="relative flex min-h-[100svh] items-end overflow-hidden md:items-center">
        <HeroVideo
          soundOnLabel={t("hero.soundOn")}
          soundOffLabel={t("hero.soundOff")}
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-night/25"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-night via-night/10 to-night/55"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-28 text-center md:pb-28">
          <span className="mb-6 rounded-full border border-sage/30 bg-sage/10 px-4 py-1.5 text-xs font-medium tracking-wide text-sage-ink backdrop-blur-sm">
            {t("hero.eyebrow")}
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-ink sm:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <SocialLink
              network="telegram"
              external
              tone="accent"
              href={TELEGRAM_BOT_URL}
            >
              {t("hero.botCta")}
            </SocialLink>
            <a
              href={APK_URL}
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-night-line bg-night-soft px-6 text-sm font-semibold text-ink transition-colors hover:border-sage/40"
            >
              <AndroidIcon className="h-5 w-5 text-sage-ink" />
              {t("hero.appCta")}
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-night-line bg-night-soft/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight">{t("features.title")}</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {features.map((f) => (
              <Link
                key={f.title}
                href={`/${locale}${f.route}`}
                className="group rounded-2xl border border-night-line bg-night p-6 transition-colors hover:border-sage/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <span className="text-muted/60 transition-transform group-hover:translate-x-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{f.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="channels" className="border-t border-night-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight">{t("channels.title")}</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col rounded-2xl border border-night-line bg-night p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-inset ring-accent/30">
                  <SocialIcon network="telegram" className="h-6 w-6 text-muted" />
                </span>
                <h3 className="text-lg font-semibold">{t("channels.botTitle")}</h3>
              </div>
              <p className="mt-4 flex-1 text-sm leading-6 text-muted">{t("channels.botText")}</p>
              <SocialLink
                network="telegram"
                external
                size="sm"
                href={TELEGRAM_BOT_URL}
                className="mt-6"
              >
                {t("channels.botCta")}
              </SocialLink>
            </div>
            <div className="flex flex-col rounded-2xl border border-night-line bg-night p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage/15 text-sage-ink">
                  <AndroidIcon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-semibold">{t("channels.appTitle")}</h3>
              </div>
              <p className="mt-4 flex-1 text-sm leading-6 text-muted">{t("channels.appText")}</p>
              <a
                href={APK_URL}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-night-line bg-night-soft px-5 text-sm font-semibold text-ink transition-colors hover:border-sage/40"
              >
                <AndroidIcon className="h-4 w-4 text-sage-ink" />
                {t("hero.appCta")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="contacts" className="border-t border-night-line bg-night-soft/40">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">{t("contacts.title")}</h2>
          <p className="mt-4 text-base leading-7 text-muted">{t("contacts.text")}</p>
          <a
            href="mailto:support@dharana.ru"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-sage px-6 text-sm font-semibold text-sage-on transition-colors hover:bg-sage/90"
          >
            <MailIcon className="h-5 w-5" />
            {t("contacts.emailCta")}
          </a>
        </div>
      </section>
    </div>
  );
}