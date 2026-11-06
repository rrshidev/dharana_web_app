import type { Locale } from "@/lib/i18n/settings";

/**
 * Юридические реквизиты проекта.
 *
 * Если появится зарегистрированное ИП/ООО, добавьте его сюда: наименование,
 * ИНН/ОГРН, адрес и т. д. Сейчас оператором выступает проект Dharana,
 * а единственный публичный контакт — support@dharana.ru.
 */
export const LEGAL = {
  siteUrl: "https://dharana.ru",
  contactEmail: "support@dharana.ru",
  version: "1.0",
  effectiveDate: {
    ru: "5 ноября 2026 г.",
    en: "5 November 2026",
  } satisfies Record<Locale, string>,
} as const;

export const LEGAL_PATHS = {
  privacy: "privacy",
  consent: "consent",
  about: "about",
} as const;

export function legalHref(locale: Locale, page: keyof typeof LEGAL_PATHS) {
  return `/${locale}/${LEGAL_PATHS[page]}`;
}
