# Dharana Web App — AGENTS.md

Веб-приложение Dharana (лендинг + каталог асан) на Next.js, общий бэкенд FastAPI. Краткий мануал для работы без вопросов.

## Стек и версии (важно!)
- **Next.js 15.5.25** (НЕ 16! create-next-app даёт 16.3.4, который ломает сборку на RSC: `(0, X.createContext) is not a function` в `next/navigation`. Не обновляться на 16 без острой нужды).
- React 19.2.8, Tailwind CSS v4 (config-less, токены — `@theme` в `app/globals.css`), TypeScript strict, i18next (один namespace `common`, ru/en).
- Сборка: `npm run build` (standalone). ESLint flat config: импорты `eslint-config-next/core-web-vitals.js` + `/typescript.js` (с расширением .js). Warn `nextVitals is not iterable` на сборке — безобиден.

## i18n (архитектура — ловушки)
- `lib/i18n/settings.ts` (locales/defaultLocale/isLocale), `lib/i18n/server.ts` (`getServerTranslation(locale)`), переводы `lib/i18n/locales/{ru,en}/common.json`.
- **НЕЛЬЗЯ импортировать `react-i18next` в Server Component**: тянет `createContext` из react-server-сборки → падение сборки. Server components используют чистый `createInstance` (без initReactI18next), текст со страницы SSR-ится.
- Для клиентских компонентов (формы Ф3+, интерактив) — отдельный клиентский инстанс с `initReactI18next` в **client**-boundary (ещё не сделан).
- i18next `resources` при init передавать ПОЛНОЙ вложенностью `{ru:{common:{...}}, en:{...}}`, а не `{common:{...}}` — иначе ключи не резолвятся (реальный баг, исправлен 2026-09-06).

## Маршрутизация / локаль
- Страницы: `app/[locale]/page.tsx` (лендинг), статически prerender /ru и /en.
- `middleware.ts` — только для переадресации неизвестных путей на `/ru`. ВАЖНО: **standalone-сборка Next НЕ исполняет middleware** — редирект `https://dharana.ru/` → `/ru` делает Caddy (`redir @root /ru permanent`). Корневого `app/page.tsx` нет намеренно (Next требует root-layout, которого нет при `[locale]`-топ-левеле).
- Не создавать `app/page.tsx`/`app/layout.tsx` рядом с `app/[locale]` без согласования — сломает сборку.
- Внутренние ссылки всегда с префиксом локали (`/{locale}/login`).

## Backend API (общий FastAPI)
- Base URL: `NEXT_PUBLIC_API_URL` (прод `https://api.dharana.ru`, dev `http://localhost:8000`), см. `lib/constants.ts`.
- Aвторизация: `POST /auth/register` и `POST /auth/login` (email+password) → JWT bearer. CORS уже включает dharana.ru (localhost:3000/8080 тоже).
- Каталог/асаны/категории/комплексы — см. `dharana-api/app/routers/*` (там же детали премиум-гейтов и полей). Сверяться с контрактами перед реализацией Ф4+.
- Бот: `@yogaasana_bot` → `https://t.me/yogaasana_bot`.

## Деплой (VPS)
- SSH: **`ssh dharana_ai`** (user `yogin_ai`, sudo NOPASSWD, docker). Секреты — в `/opt/dharana/.env` и compose, наружу НЕ копировать.
- Всё в `/opt/dharana`: `docker-compose.yml` (postgres, dharana-api, caddy, web, yoga-bot), `Caddyfile`, `dharana-web-app/` (исходники сайта, root), `downloads/apk/dharana.apk` (`https://dharana.ru/download/dharana.apk`).
- Сайт: `caddy` (80/443, TLS Let's Encrypt авто) → `web:3000` (контейнер `dharana-web-app`, НЕ публикует хост-порт). `api.dharana.ru` → `dharana-api:8000`.
- Рекомендуемый процесс деплоя кода: закоммитить/запушить на GitHub → на сервере `cd /opt/dharana && sudo docker compose up -d --build web` (docker-compose.yml монтирует `./dharana-web-app` как build-context — после `git pull` в `/opt/dharana/dharana-web-app`).
- Powershell 5.1 на локальной машине: ssh-команды с одинарными/двойными кавычками — вложенные двойные ломаются (использовать одинарные внутри или убирать).

## Команды
- Dev: `npm run dev` (адрес http://localhost:3000)
- Сборка: `npm run build`; прод-запуск локал: `npx next start -p 3011`
- Docker-образ: multi-stage, `output: standalone`, юзер nextjs, порт 3000, `CMD ["node","server.js"]`.