import type { MetadataRoute } from "next";

export const dynamic = "force-static";

function stripIndex(locale: string): string {
  return locale === "ru" ? "" : "/en";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://dharana.ru";

  const landing = [
    { url: `${base}${stripIndex("ru")}/`, priority: 1, changeFrequency: "weekly" as const },
    { url: `${base}${stripIndex("en")}/`, priority: 0.9, changeFrequency: "weekly" as const },
  ];

  return landing.map((page) => ({
    ...page,
    changeFrequency: page.changeFrequency,
    alternates: {
      languages: {
        ru: `${base}${stripIndex("ru")}/`,
        en: `${base}${stripIndex("en")}/`,
      },
    },
  }));
}