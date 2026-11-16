export const TELEGRAM_BOT_URL = "https://t.me/yogaasana_bot";

// MAX (МАКС): OAuth для сторонних сайтов нет — вход идёт через мини-приложение
// бота. Никнейм бота выдаёт платформа MAX; пусто — кнопка MAX не показывается.
// NEXT_PUBLIC_MAX_BOT_NAME подставляется на сборке (см. deploy/.env).
export const MAX_BOT_NAME = process.env.NEXT_PUBLIC_MAX_BOT_NAME ?? "";
export const MAX_BOT_URL = MAX_BOT_NAME ? `https://max.ru/${MAX_BOT_NAME}` : "";

export const APK_URL = "/download/dharana.apk";

// Амбиент-видео лендинга (пальмы, первый экран). Файл отдаёт Caddy
// `/video/*` с range-запросами (root /opt/dharana/downloads/video).
// Когда появится объектное хранилище с CDN — заменяется одним URL здесь.
export const AMBIENT_VIDEO_URL = "https://dharana.ru/video/dharana-ambient-v2.mp4";

// Заглушка-постер первого кадра (public/img/landing-hero-poster.jpg, ~125 КБ).
export const AMBIENT_POSTER_URL = "/img/landing-hero-poster.jpg";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const API_PREFIX = "/api/v1";

// Публичный адрес сайта — для redirectUri, который VK ID сверяет с консолью.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dharana.ru";

// Google OAuth Web Client ID (Google Identity Services). Пусто — кнопка прячется.
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// VK ID Client ID (https://id.vk.ru). Пусто — виджет входа не показывается.
// MAX — отдельный провайдер: у него нет OAuth, вход идёт через мини-приложение
// бота (см. MAX_BOT_URL), это не тот же вход, что VK ID.
export const VK_CLIENT_ID = process.env.NEXT_PUBLIC_VK_CLIENT_ID ?? "";

// Яндекс OAuth Client ID (https://oauth.yandex.ru). Пусто — кнопка прячется.
export const YANDEX_CLIENT_ID = process.env.NEXT_PUBLIC_YANDEX_CLIENT_ID ?? "";