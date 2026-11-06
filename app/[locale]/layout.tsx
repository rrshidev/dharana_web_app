import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { YandexMetrica } from "@/components/analytics/yandex-metrica";
import { APK_URL, TELEGRAM_BOT_URL } from "@/lib/constants";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import "../globals.css";

// Шрифты (Inter, Cormorant Garamond, Geist Mono) подключены локально
// через @font-face в app/globals.css — без сборки из Google Fonts.

const siteUrl = "https://dharana.ru";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "en" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: `${t("hero.eyebrow")} — ${t("brand")}`,
    description: t("hero.subtitle"),
    openGraph: {
      type: "website",
      url: siteUrl,
      siteName: t("brand"),
      title: `${t("hero.title")} — ${t("brand")}`,
      description: t("hero.subtitle"),
      locale: locale === "ru" ? "ru_RU" : "en_US",
      alternateLocale: locale === "ru" ? ["en_US"] : ["ru_RU"],
      images: [
        {
          url: `${siteUrl}/og.png`,
          width: 1200,
          height: 630,
          alt: `${t("brand")} — ${t("hero.subtitle")}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${t("hero.title")} — ${t("brand")}`,
      description: t("hero.subtitle"),
      images: [`${siteUrl}/og.png`],
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Dharana",
  applicationCategory: "HealthApplication",
  operatingSystem: "Android",
  description:
    "Dharana — йога-ассистент: каталог асан с инструкциями, готовые комплексы, таймер практики и персональный генератор последовательностей.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    ratingCount: "1",
    bestRating: "5",
    worstRating: "1",
  },
  publisher: { "@type": "Organization", name: "Dharana" },
  potentialAction: {},
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Props["params"];
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { t } = await getServerTranslation(locale);

  return (
    <html
      lang={locale}
      className="h-full antialiased"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{var t=localStorage.getItem("dharana:theme");if(t==="dark"){document.documentElement.dataset.theme="dark";}}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <YandexMetrica />
        <Header locale={locale} t={t} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} t={t} />
        <CookieConsent
          locale={locale}
          labels={{
            title: t("legal.cookieTitle"),
            text: t("legal.cookieText"),
            policyLink: t("legal.privacyLink"),
            acceptAll: t("legal.cookieAccept"),
            necessaryOnly: t("legal.cookieDecline"),
            closeLabel: t("legal.cookieClose"),
          }}
        />
        <MobileNav
          locale={locale}
          labels={{
            overview: t("nav.overview"),
            timer: t("nav.timer"),
            favorites: t("nav.favorites"),
            profile: t("nav.profile"),
          }}
        />
      </body>
    </html>
  );
}