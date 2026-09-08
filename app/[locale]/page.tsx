import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { APK_URL, TELEGRAM_BOT_URL } from "@/lib/constants";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.9 4.1c.3-.1.6.3.5.6l-3.2 15.3c-.2.9-1.2 1.3-2 .9l-5.2-3.9a1.4 1.4 0 0 0-1.8 0l-3.4 2.7c-.5.4-1.2.3-1.5-.3L2.3 7.7C1.7 6.7 2.5 5.4 3.6 5.4l18.3-.9zM8.6 9.5l7.6-4.3a.4.4 0 0 1 .5.6l-5.4 6.3a2 2 0 0 0-.7 1.4l-.1 2.8c0 .4-.4.6-.7.4l-.8-2-1-1.3a.5.5 0 0 1 .6-.9z" />
    </svg>
  );
}

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6 9.5A1.5 1.5 0 0 1 7.5 8h9A1.5 1.5 0 0 1 18 9.5v6a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 15.5v-6zm3-6.1l1.2-1.4a.5.5 0 0 1 .7-.1l1 1.2a5.3 5.3 0 0 1 2.2 0l1-1.2a.5.5 0 0 1 .7.1L17 3.4a4 4 0 0 1 1.6 2.1h-12A4 4 0 0 1 9 3.4zm-.9 1.3a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6zm7.8 0a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6zm-8.8 4.1h9.8v6h-9.8v-6zM7.5 19h1v2a1 1 0 1 1-2 0v-2zm9 0h1v2a1 1 0 1 1-2 0v-2z" />
    </svg>
  );
}

type Props = { params: Promise<{ locale: string }> };

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { t } = await getServerTranslation(locale);

  const features = t("features.items", { returnObjects: true }) as Array<
    { title: string; route: string; text: string }
  >;

  return (
    <div className="overflow-hidden">
      <section className="relative">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-sage/10 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-20 text-center sm:pt-28">
          <span className="mb-6 rounded-full border border-sage/30 bg-sage/10 px-4 py-1.5 text-xs font-medium tracking-wide text-sage">
            {t("hero.eyebrow")}
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-telegram px-6 text-sm font-semibold text-white transition-colors hover:bg-[#229ed9]"
            >
              <TelegramIcon className="h-5 w-5" />
              {t("hero.botCta")}
            </a>
            <a
              href={APK_URL}
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-night-line bg-night-soft px-6 text-sm font-semibold text-ink transition-colors hover:border-sage/40"
            >
              <AndroidIcon className="h-5 w-5 text-sage" />
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
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-telegram/15 text-telegram">
                  <TelegramIcon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-semibold">{t("channels.botTitle")}</h3>
              </div>
              <p className="mt-4 flex-1 text-sm leading-6 text-muted">{t("channels.botText")}</p>
              <a
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-telegram px-5 text-sm font-semibold text-white transition-colors hover:bg-[#229ed9]"
              >
                <TelegramIcon className="h-4 w-4" />
                {t("contacts.bot")}
              </a>
            </div>
            <div className="flex flex-col rounded-2xl border border-night-line bg-night p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage/15 text-sage">
                  <AndroidIcon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-semibold">{t("channels.appTitle")}</h3>
              </div>
              <p className="mt-4 flex-1 text-sm leading-6 text-muted">{t("channels.appText")}</p>
              <p className="mt-3 text-xs text-muted/70">{t("channels.appHint")}</p>
              <a
                href={APK_URL}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-night-line bg-night-soft px-5 text-sm font-semibold text-ink transition-colors hover:border-sage/40"
              >
                <AndroidIcon className="h-4 w-4 text-sage" />
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
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-telegram px-6 text-sm font-semibold text-white transition-colors hover:bg-[#229ed9]"
          >
            <TelegramIcon className="h-5 w-5" />
            {t("contacts.bot")}
          </a>
        </div>
      </section>
    </div>
  );
}