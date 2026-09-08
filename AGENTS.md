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
- **Интерполяция**: серверный инстанс включает `interpolation: { prefix: "{", suffix: "}" }` (`lib/i18n/server.ts`) — `t("key", {var})` подставляет `{var}`. НО если строку с `{foo}` прогнать через `t()` БЕЗ передаваемой переменной, i18next вычистит плейсхолдер навсегда (сервер давно заSSR-ен, уже не поменять). Поэтому для ключей, которые интерполируются на КЛИЕНТЕ (`.replace(...)`) — использовать `%token%`, а не `{token}` (пример: timer.notifyAsana — «Асана: %name%»).

## Маршрутизация / локаль
- Страницы: `app/[locale]/page.tsx` (лендинг), статически prerender /ru и /en. Каталог/асаны/login/register — `export const dynamic = "force-dynamic"` (фетчатся на запрос), не кэшировать.
- `middleware.ts` — переадресация неизвестных путей на `/ru`. ВНИМАНИЕ: **в standalone-сборке middleware ИСПОЛНЯЕТСЯ** (проверено 2026-09-07: `/icon.svg` → 307 на `/ru/icon.svg`, пока не добавили его в matcher). Корневого `app/page.tsx` нет намеренно (Next требует root-layout, которого нет при `[locale]`-топ-левеле), поэтому редирект `https://dharana.ru/` → `/ru` дублирует Caddy (`redir @root /ru permanent`) — не мешает друг другу.
- **Matcher ОБЯЗАТЕЛЬНО исключает `api` и все корневые статик-ресурсы**: `"/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|download).*)"`. Иначе middleware заворачивает `/api/*` в `/ru/api/*` и ломает `app/icon.svg` (redirect `/icon.svg` → `/ru/icon.svg` → 404) — реальные баги, исправлены 2026-09-06 и 2026-09-07.
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
- **Тар-деплой «не удаляет» удалённые файлы** (tar -xf только распаковывает поверх). Если файл удалён локально — он останется на сервере и попадёт в docker build context → призрачные артефакты (реальный кейс 2026-09-07: старый `app/favicon.ico` победил новый `app/icon.svg` в метаданных). После удаления файла в репо — снести его вручную на сервере: `ssh dharana_ai 'rm -f /opt/dharana/dharana-web-app/<path>'` и пересобрать.
- **Проверка свежести деплоя — ловушка хэшей**: docker-сборка (standalone, в Dockerfile `ENV NODE_ENV=production`) даёт ДРУГИЕ имена/хэши чанков, чем локальный `next build`/`next start`. Сверка имён чанков `_next/static` с локалкой для оценки свежести бесполезна. Проверять по содержимому: `sha256sum` исходников на хосте (`/opt/dharana/dharana-web-app/**`) против локальных, или grep маркерного стринга в задеплоенном чанке (например новое i18n-значение). Новый чанк пула подтягивается с `/ru/timer` → ищем `page-<hash>.js` в HTML страницы.
- **Звук таймера требует жеста**: `AudioContext` можно создавать/резюмить только в обработчике пользовательского взаимодействия (start-кнопка). `components/timer/timer-alerts.ts` — синтез Web Audio (nudge C6 / gong 392·587·784 Гц), никаких файлов; `Notification.requestPermission()` — тоже при старте практики; `navigator.vibrate()` только мобильный Chrome; iOS Safari не умеет web-Notifications (там гонг/вибрация). Не пытаться запускать audio вне клика — авто-policy Chrome молча блокирует.

## Админ-панель (добавлено 2026-09-08)
- Раздел `/[locale]/admin/**`: layout `app/[locale]/admin/layout.tsx` с гейтом `getProfile().is_admin` (не админ → `notFound()`; гость → requireAuth → login). Табы чуть ниже layout.
- Данные — серверные хелперы `lib/api/admin.ts` (GET `/admin/stats`, `/admin/stats/series?days=`, `/admin/metrics`, `/admin/activity`, `/admin/users`, `/admin/users/{id}`, `/admin/users/{id}/activity?days=`, `/admin/payments?status=`, `/admin/sequences`, `/admin/asanas`). Бэкенд требует JWT-админа (`require_admin`, 403).
- Мутации — только route-handlers `app/api/admin/*`, они проксируют на бэкенд с httpOnly-кукой (`lib/api/admin-actions.ts`). **JSON-операции** — `apiFetch` (сам ставит Content-Type json); **multipart/upload** — raw `fetch` с FormData (apiFetch сломает boundary). **Все upload-файлы идут под именем поля `file`** (загрузки асан photo/video, видео комплексов, медиа в сообщении). JSON→multipart-эндпоинты (create asana, update sequence/asana info в admin.py принимают `Form(...)`) — через `formAdmin()`.
- `[name]`-параметры асан в путях — `normalizePathParam()` + `encodeURIComponent` (ловушка percent-encoding в прод-рантайме).
- recharts — единственная зависимость графиков (клиентские компоненты `components/charts/*`); данные графикам передаются с серверной страницы (серверное i18n через labels-пропсы, react-i18next в client НЕ используется). Период — query `?days=7|30|90` через `components/charts/period-selector.tsx`.
- **Ловушка RSC (реальный баг 2026-09-08)**: функции НЕЛЬЗЯ передавать пропсами из server в client-компоненты — в рантайме при SSR падает «Application error» (digest) на всю страницу (сборка при этом проходит!). `mediaUrl` (из lib/api/media.ts) передавали как `mediaUrl={mediaUrl}` в payments/content — страницы Заявки/Контент падали целиком. Урок: **абсолютные URL считать на сервере** (в page.tsx через `.map(mediaUrl)`) и передавать строки, а не функцию.
- **Ловушка лимита API**: GET `/admin/users` у бэкенда `limit: le=100` — передача 200 даёт 422 → клиент тихо показывает пустой список. Сейчас в `getAdminUsers` есть `Math.min(100, …)` (админ. users page передаёт 100).
- Прод-админы: id=2 rrshidev@gmail.com, id=4 Oleg (email null). Тест-аккаунт webtest (id=16) временно admin (выдать/снять через psql `app_users.is_admin`).

## Команды
- Dev: `npm run dev` (адрес http://localhost:3000)
- Сборка: `npm run build`; прод-запуск локал: `npx next start -p 3011`
- Docker-образ: multi-stage, `output: standalone`, юзер nextjs, порт 3000, `CMD ["node","server.js"]`.