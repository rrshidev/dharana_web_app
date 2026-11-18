import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Next использует inline-скрипты, поэтому script-src не ограничиваем;
  // запрещаем фрейминг и подмену base/form-action.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
];

// Мини-приложение MAX открывается внутри мессенджера (webview или iframe на
// web.max.ru), поэтому для его страницы разрешаем фрейминг только доменами MAX.
// CSP frame-ancestors имеет приоритет над X-Frame-Options.
const miniAppHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      "frame-ancestors https://max.ru https://*.max.ru; base-uri 'self'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // Админка загружает видео асан/комплексов (десятки/сотни МБ) через route handlers.
  // По умолчанию Next.js ограничивает тело запроса ~10MB. В Next 15.5 значение
  // также должно быть в experimental, иначе runtime берёт дефолт 10MB.
  middlewareClientMaxBodySize: "300mb",
  experimental: {
    middlewareClientMaxBodySize: "300mb",
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/:locale/max/:path*", headers: miniAppHeaders },
    ];
  },
};

export default nextConfig;
