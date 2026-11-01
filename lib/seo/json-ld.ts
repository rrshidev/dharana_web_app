/**
 * Безопасная сериализация JSON-LD для вставки в <script type="application/ld+json">.
 *
 * JSON.stringify не экранирует `<`, поэтому данные из БД (`</script><script>…`)
 * могли вырваться из тега и выполниться как HTML/JS. Заменяем символы на
 * \u-последовательности — для JSON это тот же текст, для HTML-парсера — инертные.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
