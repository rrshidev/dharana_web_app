import type { MetadataRoute } from "next";

const base = "https://dharana.ru";

async function fetchAllAsanas(): Promise<{ name: string }[]> {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "https://api.dharana.ru";
  const prefix = "/api/v1";
  const limit = 200;
  let offset = 0;
  const all: { name: string }[] = [];
  try {
    for (;;) {
      const res = await fetch(`${api}${prefix}/asanas?limit=${limit}&offset=${offset}`, {
        cache: "no-store",
      });
      if (!res.ok) break;
      const data = (await res.json()) as { items: { name: string }[]; total: number };
      all.push(...(data.items ?? []));
      if (all.length >= data.total || data.items.length === 0) break;
      offset += data.items.length;
    }
  } catch {
    // backend недоступен — вернём sitemap с базовыми страницами
  }
  return all;
}

export const dynamic = "force-dynamic";

// Реальная дата последнего массового изменения контента страниц
// (деплой SEO-фиксов canonical/robots 2026-09-21). Стабильная, не каждый день.
const contentUpdatedAt = new Date("2026-09-21T00:00:00.000Z");

type Page = {
  url: string;
  priority: number;
  changeFrequency: "weekly" | "monthly";
  langPath: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const landing = [
    { url: `${base}/ru`, priority: 1, changeFrequency: "weekly" as const, langPath: "/ru" },
    { url: `${base}/en`, priority: 0.9, changeFrequency: "weekly" as const, langPath: "/en" },
  ];

  const catalogPages = [
    { url: `${base}/ru/catalog`, priority: 0.8, changeFrequency: "weekly" as const, langPath: "/ru/catalog" },
    { url: `${base}/en/catalog`, priority: 0.8, changeFrequency: "weekly" as const, langPath: "/en/catalog" },
  ];

  const timerPages = [
    { url: `${base}/ru/timer`, priority: 0.7, changeFrequency: "weekly" as const, langPath: "/ru/timer" },
    { url: `${base}/en/timer`, priority: 0.7, changeFrequency: "weekly" as const, langPath: "/en/timer" },
  ];

  const complexesPages = [
    { url: `${base}/ru/complexes`, priority: 0.6, changeFrequency: "monthly" as const, langPath: "/ru/complexes" },
    { url: `${base}/en/complexes`, priority: 0.6, changeFrequency: "monthly" as const, langPath: "/en/complexes" },
  ];

  const asanas = await fetchAllAsanas();
  const asanaPages = asanas.flatMap<Page>((asana) => {
    const slug = encodeURIComponent(asana.name);
    return [
      { url: `${base}/ru/asana/${slug}`, priority: 0.7, changeFrequency: "monthly" as const, langPath: `/ru/asana/${slug}` },
      { url: `${base}/en/asana/${slug}`, priority: 0.7, changeFrequency: "monthly" as const, langPath: `/en/asana/${slug}` },
    ];
  });

  const pages: Page[] = [...landing, ...catalogPages, ...timerPages, ...complexesPages, ...asanaPages];

  return pages.map(({ url, priority, changeFrequency, langPath }) => {
    const sibling = langPath.startsWith("/ru")
      ? langPath.replace(/^\/ru/, "/en")
      : langPath.replace(/^\/en/, "/ru");
    return {
      url,
      lastModified: contentUpdatedAt,
      priority,
      changeFrequency,
      alternates: {
        languages: {
          ru: `${base}${langPath.startsWith("/ru") ? langPath : sibling}`,
          en: `${base}${langPath.startsWith("/en") ? langPath : sibling}`,
        },
      },
    };
  });
}