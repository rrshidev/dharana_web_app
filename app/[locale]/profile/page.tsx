import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { requireAuth } from "@/lib/api/guard";
import {
  getProfile,
  getPracticeStats,
  getSubscriptionStatus,
  getProfileAvatars,
} from "@/lib/api/user";
import { getPracticeHistory } from "@/lib/api/timer";
import { aggregateActivity } from "@/lib/stats/aggregate";
import { mediaUrl } from "@/lib/api/media";
import { ProfileActions } from "@/components/profile/profile-actions";
import { ProfileAvatar } from "@/components/profile/avatar-picker";
import { LinkTelegram } from "@/components/profile/link-telegram";
import { EmailVerifyBanner } from "@/components/profile/email-verify-banner";
import { ActivitySection } from "@/components/profile/activity-section";
import { SparkleIcon, CreditCardIcon, ChevronRightIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ days?: string }> };

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

export default async function ProfilePage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireAuth(locale, `/${locale}/profile`);
  const { t } = await getServerTranslation(locale);

  const sp = await searchParams;
  const days = [7, 30, 90].includes(Number(sp.days)) ? Number(sp.days) : 30;

  let profile: Awaited<ReturnType<typeof getProfile>> | null = null;
  let stats: Awaited<ReturnType<typeof getPracticeStats>> | null = null;
  let sub: Awaited<ReturnType<typeof getSubscriptionStatus>> | null = null;
  let history: Awaited<ReturnType<typeof getPracticeHistory>> | null = null;
  let avatars: Awaited<ReturnType<typeof getProfileAvatars>> = [];
  let error = false;

  try {
    [profile, stats, sub, history] = await Promise.all([
      getProfile(),
      getPracticeStats(),
      getSubscriptionStatus(),
      getPracticeHistory(500),
    ]);
  } catch {
    error = true;
  }

  if (!error) {
    try {
      avatars = await getProfileAvatars();
    } catch {
      avatars = [];
    }
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

  const activityPoints = history ? aggregateActivity(history.sessions, days) : [];

  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex flex-col items-center text-center">
        <ProfileAvatar
          avatarUrl={mediaUrl(profile.avatar_url)}
          name={name}
          initials={initials}
          avatars={avatars.map((a) => ({ ...a, url: mediaUrl(a.url) ?? a.url }))}
          labels={{
            title: t("profile.avatarTitle"),
            uploadBtn: t("profile.avatarUpload"),
            uploading: t("profile.avatarUploading"),
            setOk: t("profile.avatarSet"),
            error: t("profile.avatarError"),
            limit: t("profile.avatarLimit"),
          }}
        />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{name}</h1>
        {profile.username && <p className="mt-0.5 text-sm text-muted">@{profile.username}</p>}
        {memberSince && (
          <p className="mt-2 text-xs text-muted">{t("profile.memberSince", { date: memberSince })}</p>
        )}
      </div>

      {profile.email && !profile.email_verified && (
        <div className="mt-5">
          <EmailVerifyBanner
            labels={{
              title: t("profile.emailVerifyTitle"),
              hint: t("profile.emailVerifyHint"),
              resend: t("profile.emailVerifyResend"),
              sent: t("profile.emailVerifySent"),
              failed: t("profile.emailVerifyFailed"),
              frequency: t("profile.emailVerifyFrequency"),
              dismiss: t("profile.emailVerifyDismiss"),
            }}
          />
        </div>
      )}

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

      {profile.is_admin && (
        <div className="mt-3">
          <Link
            href={`/${locale}/admin`}
            className="group flex items-center gap-3 rounded-2xl border border-night-line bg-night/60 p-4 transition-colors hover:border-accent/50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <CreditCardIcon className="h-5 w-5" />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-sm font-medium">{t("admin_tab.entry")}</span>
              <span className="mt-0.5 block text-xs text-muted">{t("admin_tab.section")}</span>
            </span>
            <ChevronRightIcon className="h-4 w-4 text-muted/60 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}

      {profile.telegram_id == null && (
        <div className="mt-3">
          <LinkTelegram
            labels={{
              title: t("profile.linkTelegram"),
              subtitle: t("profile.linkTelegramSubtitle"),
              step1: t("auth.telegramStep1"),
              step2: t("auth.telegramStep2"),
              step3: t("auth.telegramStep3"),
              openBot: t("auth.telegramOpenBot"),
              codePlaceholder: t("auth.telegramCodePlaceholder"),
              confirm: t("profile.linkTelegramConfirm"),
              cancel: t("auth.telegramCancel"),
              codeRequired: t("auth.telegramCodeRequired"),
              invalid: t("auth.telegramInvalid"),
              expired: t("auth.telegramExpired"),
              failed: t("profile.linkTelegramFailed"),
              success: t("profile.linkTelegramSuccess"),
            }}
          />
        </div>
      )}

      <ActivitySection
        days={days}
        points={activityPoints}
        labels={{
          title: t("profile.activityTitle"),
          legendMinutes: t("profile.activityLegendMinutes"),
          legendSessions: t("profile.activityLegendSessions"),
          legendAsanas: t("profile.activityLegendAsanas"),
          minUnit: t("profile.activityMinUnit"),
          sesUnit: t("profile.activitySesUnit"),
          asaUnit: t("profile.activityAsaUnit"),
        }}
      />

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