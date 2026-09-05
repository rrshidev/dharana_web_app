import { createInstance, type i18n } from "i18next";
import { defaultLocale, type Locale } from "./settings";
import ru from "./locales/ru/common.json";
import en from "./locales/en/common.json";

export const resources = {
  ru: { common: ru },
  en: { common: en },
} as const;

export function createI18n(locale: Locale = defaultLocale, ns = "common"): i18n {
  const instance = createInstance();
  void instance.init({
    lng: locale,
    fallbackLng: defaultLocale,
    ns,
    defaultNS: ns,
    resources,
    interpolation: { escapeValue: false },
  });
  return instance;
}

export async function getServerTranslation(locale: string) {
  const lng: Locale = locale === "en" ? "en" : "ru";
  const i18n = createI18n(lng);
  await i18n.changeLanguage(lng);
  return { t: i18n.t.bind(i18n), i18n };
}