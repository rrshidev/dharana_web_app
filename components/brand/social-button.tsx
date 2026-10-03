import type { ReactNode } from "react";
import { SocialIcon, type SocialNetwork } from "./social-icon";

/**
 * Кнопка соцсети: контурный логотип на тонкой подложке со скруглением 12px
 * (как кнопки приложения), hover — контур ярче + мягкий градиент accent→sage
 * (тот же приём, что у таймера и выбора категорий).
 *
 * Работает и в server-компонентах (только `href`), и в клиентских (с `onClick`).
 */

const SIZE = {
  md: "h-12 px-6 text-sm",
  sm: "h-11 px-5 text-sm",
} as const;

const TONE = {
  default: "border-night-line bg-transparent text-muted hover:text-ink",
  accent: "border-accent/45 bg-accent/10 text-ink hover:text-ink",
} as const;

type CommonProps = {
  network: SocialNetwork;
  size?: keyof typeof SIZE;
  tone?: keyof typeof TONE;
  width?: "full" | "auto";
  className?: string;
  /** Убирает кнопку из порядка табуляции (когда реальный контрол — поверх, напр. GSI iframe). */
  tabIndex?: number;
};

function classes({ size = "md", tone = "default", width = "auto", className }: CommonProps) {
  return [
    "group inline-flex items-center justify-center gap-2.5 rounded-full border font-semibold transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
    SIZE[size],
    TONE[tone],
    width === "full" ? "w-full" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

function Badge({ network }: { network: SocialNetwork }) {
  return (
    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-night-highlight ring-1 ring-inset ring-night-line">
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-accent/30 to-sage/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
      <SocialIcon
        network={network}
        className="relative h-5 w-5 text-muted transition-colors duration-200 group-hover:text-ink"
      />
    </span>
  );
}

export function SocialBadge({ network }: { network: SocialNetwork }) {
  return <Badge network={network} />;
}

export function SocialLink({
  network,
  href,
  children,
  external = false,
  tabIndex,
  ...rest
}: CommonProps & { href: string; children: ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      tabIndex={tabIndex}
      className={classes({ network, ...rest })}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <Badge network={network} />
      {children}
    </a>
  );
}

export function SocialButton({
  network,
  children,
  onClick,
  disabled,
  tabIndex,
  ...rest
}: CommonProps & { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      tabIndex={tabIndex}
      className={classes({ network, ...rest })}
    >
      <Badge network={network} />
      {children}
    </button>
  );
}