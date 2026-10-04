import { NextRequest, NextResponse } from "next/server";

// Схема собственного приложения. App Links (https://dharana.ru/app/auth/...) на
// части прошивок не верифицируются — тогда колбэк приходит в браузер и вход
// не завершается. Поэтому эта страница отдаёт редирект на dharana://, который
// работает без верификации (intent-filter в AndroidManifest).
const APP_SCHEME = "dharana";

const PROVIDERS = new Set(["yandex", "vk"]);

// Пробрасываем только параметры, нужные приложению. `device_id` — обязателен
// для обмена кода VK на токен (эндпоинт id.vk.ru/oauth2/auth его требует).
const FORWARDED = ["code", "state", "error", "error_description", "device_id"];

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (!PROVIDERS.has(provider)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const search = new URLSearchParams();
  for (const key of FORWARDED) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) search.set(key, value);
  }

  const appUrl = `${APP_SCHEME}://app/auth/${provider}/callback?${search.toString()}`;
  const safeAppUrl = escapeAttr(appUrl);
  const providerName = provider === "vk" ? "VK" : "Яндекс";

  const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0;url=${safeAppUrl}" />
    <title>Возвращаем в приложение</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 32px 20px;
             text-align: center; color: #1c1b1a; }
      a { display: inline-block; margin-top: 16px; padding: 14px 24px; border-radius: 12px;
          background: #1c1b1a; color: #fff; text-decoration: none; font-weight: 600; }
      p { color: #5f5c58; }
    </style>
  </head>
  <body>
    <h1>Возвращаем в приложение…</h1>
    <p>Вход через ${providerName} почти завершён.</p>
    <p><a href="${safeAppUrl}">Открыть Dharana</a></p>
    <script>
      window.location.replace(${JSON.stringify(appUrl)});
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Не кэшировать: страница одноразовая, в параметрах код авторизации.
      "cache-control": "no-store",
    },
  });
}