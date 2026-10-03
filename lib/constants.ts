export const TELEGRAM_BOT_URL = "https://t.me/yogaasana_bot";

export const APK_URL = "/download/dharana.apk";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const API_PREFIX = "/api/v1";

// Google OAuth Web Client ID (Google Identity Services). Пусто — кнопка прячется.
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// VK ID Client ID (https://id.vk.com). Пусто — кнопки VK и MAX прячутся.
// Отдельного OAuth у MAX нет: обе кнопки идут в один и тот же вход VK ID.
export const VK_CLIENT_ID = process.env.NEXT_PUBLIC_VK_CLIENT_ID ?? "";

// Яндекс OAuth Client ID (https://oauth.yandex.ru). Пусто — кнопка прячется.
export const YANDEX_CLIENT_ID = process.env.NEXT_PUBLIC_YANDEX_CLIENT_ID ?? "";