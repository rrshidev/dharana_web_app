import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n/settings";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * CSRF-защита для /api/*: браузерные мутации должны быть same-origin.
 * SameSite=Lax у JWT-куки уже блокирует большинство cross-site POST, но
 * это дополнительный слой (и защита от edge-случаев/поддоменов).
 */
function apiGuard(request: NextRequest): NextResponse | null {
  if (!MUTATING.has(request.method.toUpperCase())) return null;

  const origin = request.headers.get("origin");
  const host = request.headers.get("host") ?? "";
  if (origin) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ ok: false, detail: "forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ ok: false, detail: "forbidden" }, { status: 403 });
    }
  }

  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") {
    return NextResponse.json({ ok: false, detail: "forbidden" }, { status: 403 });
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return apiGuard(request) ?? NextResponse.next();
  }

  // Единый вид URL: без завершающего слэша. Иначе `/ru` и `/ru/` — два
  // одинаковых 200-ответа, и Google выбирает каноническую версию сам.
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/+$/, "");
    return NextResponse.redirect(url, 308);
  }

  const first = pathname.split("/")[1];

  if (isLocale(first)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  // `app/auth` — НЕЛЬЗЯ заворачивать в /ru (реальный баг 2026-10-05): это App Link
  // колбэка OAuth для приложения. Редирект 307 на `/ru/app/auth/...` уводил
  // браузер на путь, который не матчится в AndroidManifest (pathPrefix `/app/auth`),
  // поэтому приложение не открывалось и вход не завершался.
  // `/api/:path*` — отдельный матчер: locale-редирект к API не применяется,
  // внутри обрабатывается только CSRF-guard.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|og.png|robots.txt|sitemap.xml|download|img|video|app/auth|\\.well-known|.*\\.html$).*)",
    "/api/:path*",
  ],
};
