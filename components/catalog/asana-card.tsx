import Link from "next/link";
import type { Locale } from "@/lib/i18n/settings";
import type { AsanaSummary } from "@/lib/api/catalog";
import { mediaUrl } from "@/lib/api/media";

export function AsanaCard({
  locale,
  asana,
  categoryLabel,
  difficultyLabel,
}: {
  locale: Locale;
  asana: AsanaSummary;
  categoryLabel: string;
  difficultyLabel: string;
}) {
  const img = mediaUrl(asana.image_url);

  return (
    <Link
      href={`/${locale}/asana/${encodeURIComponent(asana.name)}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-night-line bg-night/60 transition-colors hover:border-accent/50"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-night">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={asana.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-muted/40">
            🧘
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-semibold leading-snug">{asana.name}</h3>
        <p className="text-xs text-muted">{categoryLabel}</p>
        <div className="mt-auto flex items-center gap-1 pt-1" aria-label={difficultyLabel}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={`h-1.5 w-4 rounded-full ${
                n <= asana.difficulty ? "bg-accent" : "bg-night-line"
              }`}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}