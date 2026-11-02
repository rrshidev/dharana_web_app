import { NextResponse } from "next/server";
import { ApiError } from "./server";

/**
 * Единый ответ на ошибку в admin route-handlers.
 *
 * Раньше все ошибки заворачивались в 400, из-за чего попытка не-админа
 * (401/403) выглядела как «неверный запрос», а реальные сбои бэкенда
 * (404/422/5xx) терялись. Сохраняем HTTP-статус upstream, но наружу отдаём
 * только generic-код — без деталей бэкенда.
 */
export function actionErrorResponse(
  e: unknown,
  fallbackError: string,
  adminProtectedDetail?: string,
) {
  if (e instanceof ApiError) {
    if (adminProtectedDetail && e.detail === adminProtectedDetail) {
      return NextResponse.json({ error: "admin_protected" }, { status: 400 });
    }
    const status = e.status >= 400 && e.status <= 599 ? e.status : 400;
    return NextResponse.json({ error: fallbackError }, { status });
  }
  return NextResponse.json({ error: fallbackError }, { status: 400 });
}
