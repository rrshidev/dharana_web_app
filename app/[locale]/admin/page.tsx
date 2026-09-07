import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { requireAuth } from "@/lib/api/guard";
import { getProfile } from "@/lib/api/user";
import { getAdminActivity, getAdminMetrics, getAdminStats, getAdminStatsSeries } from "@/lib/api/admin";
import type { AdminActivityEvent, AdminMetrics, AdminSeries, AdminStats } from "@/lib/api/admin";
import { OverviewPanel } from "@/components/admin/overview-panel";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ days?: string }> };

const PERIODS = [7, 30, 90];

export default async function AdminOverviewPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  await requireAuth(locale, `/${locale}/admin`);

  let isAdmin = false;
  try {
    isAdmin = Boolean((await getProfile())?.is_admin);
  } catch {
    // handled below
  }
  if (!isAdmin) notFound();

  const sp = await searchParams;
  const days = PERIODS.includes(Number(sp.days)) ? Number(sp.days) : 30;

  const { t } = await getServerTranslation(locale);

  let stats: AdminStats | null = null;
  let series: AdminSeries | null = null;
  let metrics: AdminMetrics | null = null;
  let activity: AdminActivityEvent[] = [];
  try {
    [stats, series, metrics, activity] = await Promise.all([
      getAdminStats(),
      getAdminStatsSeries(days),
      getAdminMetrics(),
      getAdminActivity(),
    ]);
  } catch {
    // rendered as empty
  }

  return (
    <OverviewPanel
      days={days}
      stats={stats}
      series={series}
      metrics={metrics}
      activity={activity}
      labels={{
        statUsers: t("admin.overview.statUsers"),
        statPremium: t("admin.overview.statPremium"),
        statPractices: t("admin.overview.statPractices"),
        statMinutes: t("admin.overview.statMinutes"),
        statNewWeek: t("admin.overview.statNewWeek"),
        practicesChartTitle: t("admin.overview.practicesChartTitle"),
        growthTitle: t("admin.overview.growthTitle"),
        legendNew: t("admin.overview.legendNew"),
        legendPremium: t("admin.overview.legendPremium"),
        donutTitle: t("admin.overview.donutTitle"),
        kvTitle: t("admin.overview.kvTitle"),
        kvDau: t("admin.overview.kvDau"),
        kvWau: t("admin.overview.kvWau"),
        kvMau: t("admin.overview.kvMau"),
        kvSessionsToday: t("admin.overview.kvSessionsToday"),
        recentTitle: t("admin.overview.recentTitle"),
        recentNewUser: t("admin.overview.recentNewUser"),
        recentPractice: t("admin.overview.recentPractice"),
        noData: t("admin.overview.noData"),
        noRecent: t("admin.overview.noRecent"),
        minUnit: t("admin.overview.minUnit"),
        conversion: t("admin.overview.conversion"),
        periodChips: {
          7: t("admin.overview.period7"),
          30: t("admin.overview.period30"),
          90: t("admin.overview.period90"),
        },
      }}
    />
  );
}