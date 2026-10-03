import type { ReactNode } from "react";

/**
 * Контурные (без заливки) знаки соцсетей — требование партнёра: тонкие линии,
 * цвет контура = цвет текста интерфейса (muted/ink), hover — мягкий градиент.
 *
 * Чтобы добавить новую соцсеть (VK, MAX и т.д.): дописать ключ в `SocialNetwork`
 * и один <path> в `OUTLINE_ICONS` — кнопки, подложки и hover берут стиль отсюда.
 * Знаки намеренно без фирменных заливок: цвет задаёт CSS (currentColor).
 */
export type SocialNetwork = "google" | "telegram" | "vk" | "max" | "yandex";

const OUTLINE_ICONS: Record<SocialNetwork, ReactNode> = {
  // «G» по форме оригинала: окружность, разрыв справа сверху, горизонтальная
  // перекладина на середине высоты, уходящая внутрь (как в фирменном знаке).
  google: <path d="M16.98 7.82A6.5 6.5 0 1 0 18.5 12H12.2" />,
  // Телеграм: контур «бумажного самолётика» + линия сгиба.
  telegram: (
    <>
      <path d="M21.5 3.5 2.8 10.7a1 1 0 0 0 0 1.8l4.7 1.6 1.8 5.4a1 1 0 0 0 1.7.1l2.4-2.6 4.6 3.4a1 1 0 0 0 1.5-.7l3.4-15a1 1 0 0 0-.9-1.2z" />
      <path d="M9.5 13.5 19 7.5l-6.7 7.7" />
    </>
  ),
  // VK: литеры «V» и «K» одной группой штрихов.
  vk: (
    <>
      <path d="M3 6.2 7.4 18.2 11.8 6.2" />
      <path d="M13.6 6.2v12" />
      <path d="M19.8 6.2 14.4 12.2l5.4 6" />
    </>
  ),
  // MAX: «М» одним ломаным штрихом. Знак нарисован вручную — когда появятся
  // официальные бренд-ассеты, путь заменяется на фирменный (остальное не меняется).
  max: <path d="M4 18.5V5.5l5 8 5-8v13" />,
  // Яндекс: «Я» — ствол справа, чаша сверху слева, нога вниз-влево.
  yandex: (
    <>
      <path d="M14 21V3H9.6a5.4 5.4 0 0 0 0 10.8H14" />
      <path d="M9.6 13.8 4.4 21" />
    </>
  ),
};

export function SocialIcon({
  network,
  className,
  strokeWidth = 1.5,
}: {
  network: SocialNetwork;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {OUTLINE_ICONS[network]}
    </svg>
  );
}