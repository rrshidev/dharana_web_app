import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { isLocale, type Locale, locales } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { APK_URL, TELEGRAM_BOT_URL } from "@/lib/constants";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = "https://dharana.ru";

function pagePath(locale: string): string {
  return locale === "ru" ? "" : `/${locale}`;
}

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "en" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  const path = pagePath(locale);
  const url = `${siteUrl}${path}/`;
  const localeString = locale === "ru" ? "ru" : "en";

  const alternates: Record<string, string> = Object.fromEntries(
    locales.map((l) => [l, `${siteUrl}${pagePath(l)}/`]),
  );

  return {
    metadataBase: new URL(siteUrl),
    title: `${t("hero.eyebrow")} — ${t("brand")}`,
    description: t("hero.subtitle"),
    alternates: { canonical: url, languages: alternates },
    openGraph: {
      type: "website",
      url,
      siteName: t("brand"),
      title: `${t("hero.title")} — ${t("brand")}`,
      description: t("hero.subtitle"),
      locale: localeString,
      alternateLocale: Object.values(alternates).reduce<string[]>((acc, l) => {
        if (!acc.includes(l)) acc.push(l);
        return acc;
      }, []),
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <Header locale={locale} t={t} />
        <main className="flex-1">{children}</main>
        <Footer t={t} />
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