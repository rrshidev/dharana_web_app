import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n/settings";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (isLocale(first)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // `app/auth` — НЕЛЬЗЯ заворачивать в /ru (реальный баг 2026-10-05): это App Link
  // колбэка OAuth для приложения. Редирект 307 на `/ru/app/auth/...` уводил
  // браузер на путь, который не матчится в AndroidManifest (pathPrefix `/app/auth`),
  // поэтому приложение не открывалось и вход не завершался.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|og.png|robots.txt|sitemap.xml|download|app/auth|\\.well-known|.*\\.html$).*)"],
};