"use client";

import { useEffect, useState } from "react";
import { injectMetrica, METRIKA_ID } from "@/lib/analytics/metrica";
import { readCookieConsent, subscribeCookieConsent } from "@/lib/legal/consent-store";

/**
 * Загружает Яндекс Метрику только после явного согласия на аналитические
 * cookies. При отзыве согласия счётчик уничтожается и скрипт удаляется.
 */
export function YandexMetrica() {
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const sync = () => setAnalytics(readCookieConsent()?.analytics === true);
    sync();
    return subscribeCookieConsent(sync);
  }, []);

  useEffect(() => {
    if (!analytics || METRIKA_ID <= 0) return;
    const code = injectMetrica();
    if (!code) return;
    const script = document.createElement("script");
    script.dataset.dharanaMetrica = "1";
    script.text = code;
    document.head.appendChild(script);
    return () => {
      script.remove();
      disableMetrica();
    };
  }, [analytics]);

  return null;
}

function disableMetrica() {
  if (typeof window === "undefined" || METRIKA_ID <= 0) return;
  const win = window as Window & { ym?: (...args: unknown[]) => void };
  if (typeof win.ym === "function") {
    try {
      win.ym(METRIKA_ID, "destruct");
    } catch {
      // Счётчик мог быть уже уничтожен.
    }
  }
  document
    .querySelectorAll('script[src*="mc.yandex.ru/metrika"]')
    .forEach((element) => element.remove());
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !name.startsWith("_ym")) return;
    document.cookie = `${name}=; Max-Age=0; path=/`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname}`;
  });
  delete win.ym;
}
