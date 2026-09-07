export function shortDay(iso: string): string {
  if (iso.length >= 10) {
    return `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
  }
  return iso;
}

export function dateDay(iso: string): string {
  if (iso.length >= 10) {
    return `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
  }
  return "-";
}

/** Шаг прореживания подписей по оси X, как в приложении. */
export function labelInterval(n: number): number {
  if (n <= 14) return 1;
  return Math.ceil(n / 6);
}

/** Ширина столбцов, зависящая от количества дней. */
export function barWidth(n: number): number {
  if (n >= 90) return 3;
  if (n >= 31) return 5;
  if (n >= 15) return 8;
  return 16;
}