import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { requireAuth } from "@/lib/api/guard";
import { getProfile } from "@/lib/api/user";
import { getAdminPayments } from "@/lib/api/admin";
import { PaymentsPanel } from "@/components/admin/payments-panel";
import { mediaUrl } from "@/lib/api/media";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
};

const STATUSES = ["all", "pending", "confirmed", "rejected"] as const;

async function assertAdmin(locale: string): Promise<boolean> {
  try {
    await requireAuth(locale, `/${locale}/admin`);
    return Boolean((await getProfile())?.is_admin);
  } catch {
    return false;
  }
}

export default async function AdminPaymentsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (!(await assertAdmin(locale))) notFound();

  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as (typeof STATUSES)[number])
    ? (sp.status as string)
    : "all";

  const { t } = await getServerTranslation(locale);

  let payments: Awaited<ReturnType<typeof getAdminPayments>>["payments"] = [];
  let error = false;
  try {
    payments = (await getAdminPayments(status)).payments.map((p) => ({
      ...p,
      receipt_full_url: mediaUrl(p.receipt_url),
    }));
  } catch {
    error = true;
  }

  const statusTo = (s: string) => new URLSearchParams({ status: s }).toString();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">{t("admin.payments.title")}</h1>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((st) => (
            <Link
              key={st}
              href={`/${locale}/admin/payments${st === "all" ? "" : `?${statusTo(st)}`}`}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                status === st
                  ? "bg-accent text-night"
                  : "border border-night-line text-muted hover:text-ink"
              }`}
            >
              {t(`admin.payments.chip.${st}`)}
            </Link>
          ))}
        </div>
      </div>

      <PaymentsPanel
        locale={locale}
        payments={payments}
        error={error}
        labels={{
          empty: t("admin.payments.empty"),
          error: t("admin.payments.error"),
          amount: t("admin.payments.amount"),
          days: t("admin.payments.days"),
          user: t("admin.payments.user"),
          receipt: t("admin.payments.receipt"),
          confirm: t("admin.payments.confirm"),
          reject: t("admin.payments.reject"),
          statusPending: t("admin.payments.statusPending"),
          statusConfirmed: t("admin.payments.statusConfirmed"),
          statusRejected: t("admin.payments.statusRejected"),
          actionFailed: t("admin.payments.actionFailed"),
        }}
      />
    </div>
  );
}