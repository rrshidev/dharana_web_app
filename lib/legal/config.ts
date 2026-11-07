import type { Locale } from "@/lib/i18n/settings";

/**
 * Юридические реквизиты оператора персональных данных.
 *
 * Оператор — физическое лицо, применяющее специальный налоговый режим
 * «Налог на профессиональный доход» (самозанятый). ИНН в публичных документах
 * пока не указывается по решению оператора; при необходимости добавьте поле
 * `inn` и выведите его в текстах политики и согласия.
 */
export const LEGAL = {
  siteUrl: "https://dharana.ru",
  contactEmail: "support@dharana.ru",
  version: "1.1",
  effectiveDate: {
    ru: "6 ноября 2026 г.",
    en: "6 November 2026",
  } satisfies Record<Locale, string>,
  operator: {
    fullName: {
      ru: "Степин Руслан Дмитриевич",
      en: "Ruslan Dmitrievich Stepin",
    },
    fullNameDative: {
      ru: "Степину Руслану Дмитриевичу",
      en: "Ruslan Dmitrievich Stepin",
    },
    status: {
      ru: "самозанятый (плательщик налога на профессиональный доход)",
      en: "self-employed (professional income tax payer)",
    },
    address: {
      ru: "Российская Федерация, Брянская область, г. Новозыбков, ул. Садовая, д. 39",
      en: "Russian Federation, Bryansk Oblast, Novozybkov, Sadovaya Street, 39",
    },
    legalLine: {
      ru: "Степин Руслан Дмитриевич, самозанятый (плательщик налога на профессиональный доход), Российская Федерация, Брянская область, г. Новозыбков, ул. Садовая, д. 39",
      en: "Ruslan Dmitrievich Stepin, self-employed (professional income tax payer), Russian Federation, Bryansk Oblast, Novozybkov, Sadovaya Street, 39",
    },
  },
} as const;

export const LEGAL_PATHS = {
  privacy: "privacy",
  consent: "consent",
  about: "about",
} as const;

export function legalHref(locale: Locale, page: keyof typeof LEGAL_PATHS) {
  return `/${locale}/${LEGAL_PATHS[page]}`;
}
