import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = "https://dharana.ru";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/ru/login",
          "/en/login",
          "/ru/register",
          "/en/register",
          "/ru/profile",
          "/en/profile",
          "/ru/favorites",
          "/en/favorites",
          "/ru/filter",
          "/en/filter",
          "/ru/generator",
          "/en/generator",
          "/ru/reset-password",
          "/en/reset-password",
          "/ru/verify-email",
          "/en/verify-email",
        ],
      },
      { userAgent: "GPTBot", allow: "/", crawlDelay: 10 },
      { userAgent: "ChatGPT-User", allow: "/", crawlDelay: 10 },
      { userAgent: "ClaudeBot", allow: "/", crawlDelay: 10 },
      { userAgent: "PerplexityBot", allow: "/", crawlDelay: 10 },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}