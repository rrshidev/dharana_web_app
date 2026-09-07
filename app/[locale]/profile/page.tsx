import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { requireAuth } from "@/lib/api/guard";
import { getProfile, getPracticeStats, getSubscriptionStatus } from "@/lib/api/user";
import { mediaUrl } from "@/lib/api/media";
import { ProfileActions } from "@/components/profile/profile-actions";
import { SparkleIcon, CreditCardIcon, ChevronRightIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return {
    title: `${t("profile.title")} — ${t("brand")}`,
    robots: { index: false, follow: false },
  };
}

function formatDate(iso: string | null | undefined, locale: Locale): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireAuth(locale, `/${locale}/profile`);
  const { t } = await getServerTranslation(locale);

  let profile: Awaited<ReturnType<typeof getProfile>> | null = null;
  let stats: Awaited<ReturnType<typeof getPracticeStats>> | null = null;
  let sub: Awaited<ReturnType<typeof getSubscriptionStatus>> | null = null;
  let error = false;

  try {
    [profile, stats, sub] = await Promise.all([
      getProfile(),
      getPracticeStats(),
      getSubscriptionStatus(),
    ]);
  } catch {
    error = true;
  }

  if (error || !profile) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-12">
        <p className="rounded-2xl border border-night-line p-8 text-center text-muted">
          {t("catalog.listError")}
        </p>
      </section>
    );
  }

  const name = profile.name?.trim() || profile.email?.split("@")[0] || "—";
  const initials = Array.from(name)[0]?.toUpperCase() ?? "?";
  const memberSince = formatDate(profile.created_at, locale);

  const statsItems: Array<{ value: string; label: string }> = [
    { value: String(stats?.total_minutes ?? 0), label: t("profile.statsMinutes") },
    { value: String(stats?.total_days ?? 0), label: t("profile.statsDays") },
    { value: String(stats?.current_streak ?? 0), label: t("profile.statsStreak") },
    { value: String(stats?.total_sessions ?? 0), label: t("profile.statsSessions") },
  ];

  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex flex-col items-center text-center">
        {profile.avatar_url ? (
          <img
            src={mediaUrl(profile.avatar_url) ?? undefined}
            alt={name}
            className="h-24 w-24 rounded-full object-cover ring-2 ring-white/10"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-accent/70 to-accent/40 text-4xl font-bold text-night">
            {initials}
          </div>
        )}
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{name}</h1>
        {profile.username && <p className="mt-0.5 text-sm text-muted">@{profile.username}</p>}
        {memberSince && (
          <p className="mt-2 text-xs text-muted">{t("profile.memberSince", { date: memberSince })}</p>
        )}
      </div>

      <div className="mt-8 grid grid-cols-4 gap-2">
        {statsItems.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-night-line bg-night/60 px-2 py-4 text-center"
          >
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="mt-1 text-[11px] leading-tight text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href={`/${locale}/profile/subscription`}
          className="group flex items-center gap-3 rounded-2xl border border-night-line bg-night/60 p-4 transition-colors hover:border-accent/50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <SparkleIcon className="h-5 w-5" />
          </span>
          <span className="flex-1 text-left">
            <span className="block text-sm font-medium">{t("profile.subscription")}</span>
            <span
              className={`mt-0.5 block text-xs ${
                sub?.is_premium ? "text-accent" : "text-muted"
              }`}
            >
              {sub?.is_premium ? t("profile.premiumActive") : t("profile.freePlan")}
            </span>
          </span>
          <ChevronRightIcon className="h-4 w-4 text-muted/60 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-3">
        <ProfileActions
          locale={locale}
          labels={{
            edit: t("profile.edit"),
            logout: t("profile.logout"),
            editProfile: {
              editTitle: t("profile.editTitle"),
              nameLabel: t("profile.nameLabel"),
              usernameLabel: t("profile.usernameLabel"),
              bioLabel: t("profile.bioLabel"),
              save: t("profile.save"),
              saving: t("profile.saving"),
              nameRequired: t("profile.nameRequired"),
              nameTooLong: t("profile.nameTooLong"),
              updateFailed: t("profile.updateFailed"),
              cancel: t("profile.cancel"),
            },
          }}
          initialName={profile.name ?? ""}
          initialUsername={profile.username ?? ""}
          initialBio={profile.bio ?? ""}
        />
      </div>
    </section>
  );
}