import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { requireAuth } from "@/lib/api/guard";
import { getProfile } from "@/lib/api/user";
import { getAdminUserActivity, getAdminUserDetail } from "@/lib/api/admin";
import { UserDetailPanel } from "@/components/admin/user-detail-panel";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ days?: string }>;
};

const PERIODS = [7, 30, 90];

async function assertAdmin(locale: string): Promise<boolean> {
  try {
    await requireAuth(locale, `/${locale}/admin`);
    return Boolean((await getProfile())?.is_admin);
  } catch {
    return false;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return { title: `${t("admin.user.title")} — Dharana`, robots: { index: false } };
}

export default async function AdminUserDetailPage({ params, searchParams }: Props) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  if (!(await assertAdmin(locale))) notFound();

  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) notFound();

  const sp = await searchParams;
  const days = PERIODS.includes(Number(sp.days)) ? Number(sp.days) : 30;

  const { t } = await getServerTranslation(locale);

  let detail = null;
  let activity = null;
  try {
    [detail, activity] = await Promise.all([
      getAdminUserDetail(userId),
      getAdminUserActivity(userId, days),
    ]);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-5">
      <Link
        href={`/${locale}/admin/users`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        ← {t("admin.user.back")}
      </Link>

      <UserDetailPanel
        locale={locale}
        days={days}
        user={detail.user}
        subscription={detail.subscription}
        recentSessions={detail.recent_sessions}
        activity={activity}
        labels={{
          banned: t("admin.user.banned"),
          deleted: t("admin.user.deleted"),
          premium: t("admin.user.premium"),
          free: t("admin.user.free"),
          ban: t("admin.user.ban"),
          unban: t("admin.user.unban"),
          delete: t("admin.user.delete"),
          restore: t("admin.user.restore"),
          givePremium: t("admin.user.givePremium"),
          removePremium: t("admin.user.removePremium"),
          giving: t("admin.user.giving"),
          infoTitle: t("admin.user.infoTitle"),
          email: t("admin.user.email"),
          telegram: t("admin.user.telegram"),
          createdAt: t("admin.user.createdAt"),
          lastPractice: t("admin.user.lastPractice"),
          streakCurrent: t("admin.user.streakCurrent"),
          streakLongest: t("admin.user.streakLongest"),
          subscription: t("admin.user.subscription"),
          subType: t("admin.user.subType"),
          subEnd: t("admin.user.subEnd"),
          totalMinutes: t("admin.user.totalMinutes"),
          daysUnit: t("admin.user.daysUnit"),
          activityTitle: t("admin.user.activityTitle"),
          sessionsTitle: t("admin.user.sessionsTitle"),
          sessionsEmpty: t("admin.user.sessionsEmpty"),
          messageTitle: t("admin.user.messageTitle"),
          messagePlaceholder: t("admin.user.messagePlaceholder"),
          channelTg: t("admin.user.channelTg"),
          channelApp: t("admin.user.channelApp"),
          channelBoth: t("admin.user.channelBoth"),
          send: t("admin.user.send"),
          sending: t("admin.user.sending"),
          actionFailed: t("admin.user.actionFailed"),
          messageFailed: t("admin.user.messageFailed"),
          minutesUnit: t("admin.overview.minUnit"),
        }}
      />
    </div>
  );
}