type T = (key: string) => string;

export function Footer({ t }: { t: T }) {
  return (
    <footer className="border-t border-night-line py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-xs text-muted">
        <span>
          {t("brand")} · 2026
        </span>
        <span>{t("footer.rights")}</span>
      </div>
    </footer>
  );
}