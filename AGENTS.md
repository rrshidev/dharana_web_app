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
- Страницы: `app/[locale]/page.tsx` (лендинг), статически prerender /ru и /en. Каталог/асаны/login/register — `export const dynamic = "force-dynamic"` (фетчатся на запрос), не кэшировать.
- `middleware.ts` — только для переадресации неизвестных путей на `/ru`. ВАЖНО: **standalone-сборка Next НЕ исполняет middleware** — редирект `https://dharana.ru/` → `/ru` делает Caddy (`redir @root /ru permanent`). Корневого `app/page.tsx` нет намеренно (Next требует root-layout, которого нет при `[locale]`-топ-левеле).
- **Matcher ОБЯЗАТЕЛЬНО исключает `api`**: `"/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|download).*)"`. Иначе middleware заворачивает `/api/*` в `/ru/api/*` (реальный баг, исправлен 2026-09-06).
- Не создавать `app/page.tsx`/`app/layout.tsx` рядом с `app/[locale]` без согласования — сломает сборку.
- **Ловушка декодирования URL-сегментов (реальный баг 2026-09-07)**: под standalone-рантаймом с `NODE_ENV=production` (так деплоится прод — `ENV NODE_ENV=production HOSTNAME=0.0.0.0` в Dockerfile) Next отдаёт динамические `params` **percent-encoded**, а не декодированными (`/ru/asana/%D0%92...` → `params.name === "%D0%92..."`, а не «Вирасана»). Под `next start`/без NODE_ENV — декодирует нормально. Поэтому ВСЕ пути-параметры пропускать через `normalizePathParam()` (lib/api/catalog.ts: однократный `decodeURIComponent`, для декодированного значения no-op) перед использованием/`encodeURIComponent`. Основной пострадавший: страница `app/[locale]/asana/[name]/page.tsx` (карточки каталога вели на «Асана не найдена» на проде, локально работало — вот почему локальные тесты не ловили).
- Внутренние ссылки всегда с префиксом локали (`/{locale}/login`).

## Backend API (общий FastAPI)
- Base URL: `NEXT_PUBLIC_API_URL` (прод `https://api.dharana.ru`, dev `http://localhost:8000`), см. `lib/constants.ts`.
- **Все пути API идут через префикс `/api/v1`** (`API_PREFIX` в `lib/constants.ts`). Реальные URL: `/api/v1/auth/*`, `/api/v1/asanas`, `/api/v1/categories`, `/api/v1/media/photos/...`. lib/api/server.ts и mediaUrl() добавляют префикс сами.
- Aвторизация: `POST /api/v1/auth/register` (email/password/name) и `/api/v1/auth/login` → JWT bearer. JWT хранится в httpOnly-cookie `dharana_token`; браузер НЕ хранит токен — ходят через route handlers `app/api/auth/*` (login/register/logout/me), которые проксируют на API. 400 на register = email занят, 401 на login = неверные данные.
- Каталог (публичный): `/api/v1/categories`, `/api/v1/asanas` (`?category=&difficulty=&search=&limit=&offset=`), `/api/v1/asanas/{name}`. Поля: name, category_id, image_url (относительный `/api/v1/media/...` — клеить префикс API!), difficulty (1-5), effects[], contraindications[]. Ошибка приходит как 200 c `{"error": ...}` — проверять наличие `error`.
- `image_url` из API относительный — НЕ использовать как src напрямую, только через `mediaUrl()`.
- Бот: `@yogaasana_bot` → `https://t.me/yogaasana_bot`.
- Каталог/асаны/категории/комплексы — см. `dharana-api/app/routers/*` (там же детали премиум-гейтов и полей). Сверяться с контрактами перед реализацией Ф4+.

## Деплой (VPS)
- SSH: **`ssh dharana_ai`** (user `yogin_ai`, sudo NOPASSWD, docker). Секреты — в `/opt/dharana/.env` и compose, наружу НЕ копировать.
- Всё в `/opt/dharana`: `docker-compose.yml` (postgres, dharana-api, caddy, web, yoga-bot), `Caddyfile`, `dharana-web-app/` (исходники сайта, root), `downloads/apk/dharana.apk` (`https://dharana.ru/download/dharana.apk`).
- Сайт: `caddy` (80/443, TLS Let's Encrypt авто) → `web:3000` (контейнер `dharana-web-app`, НЕ публикует хост-порт). `api.dharana.ru` → `dharana-api:8000`.
- Рекомендуемый процесс деплоя кода: закоммитить/запушить на GitHub → на сервере `cd /opt/dharana && sudo docker compose up -d --build web` (docker-compose.yml монтирует `./dharana-web-app` как build-context — после `git pull` в `/opt/dharana/dharana-web-app`).
  - **Используемый сейчас способ (проверен)**: `/opt/dharana/dharana-web-app` НЕ git-репозиторий — деплой тарболом: локально `tar -cf web.tar --exclude=node_modules --exclude=.next --exclude=.git -C dharana_web_app .` → `scp` на сервер → `tar -xf` поверх каталога → `sudo docker compose up -d --build web`. image_url/`NEXT_PUBLIC_API_URL` запекается при build (compose env в build НЕ попадает — он и так там в правильном виде).
- Powershell 5.1 на локальной машине: ssh-команды с одинарными/двойными кавычками — вложенные двойные ломаются (использовать одинарные внутри или убирать). JSON для curl отправлять через файл (`curl --data-binary @file.json`), НЕ через `-d "{\"...\"}"` — PowerShell оставляет бэкслеши буквально → мусор в теле (реальный кейс при деплое Ф3).

## Команды
- Dev: `npm run dev` (адрес http://localhost:3000)
- Сборка: `npm run build`; прод-запуск локал: `npx next start -p 3011`
- Docker-образ: multi-stage, `output: standalone`, юзер nextjs, порт 3000, `CMD ["node","server.js"]`.