import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { requireAuth } from "@/lib/api/guard";
import { getProfile } from "@/lib/api/user";
import { BroadcastPanel } from "@/components/admin/broadcast-panel";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

async function assertAdmin(locale: string): Promise<boolean> {
  try {
    await requireAuth(locale, `/${locale}/admin`);
    return Boolean((await getProfile())?.is_admin);
  } catch {
    return false;
  }
}

export default async function AdminBroadcastPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (!(await assertAdmin(locale))) notFound();

  const { t } = await getServerTranslation(locale);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">{t("admin.broadcast.title")}</h1>
      <BroadcastPanel
        labels={{
          audience: t("admin.broadcast.audience"),
          audienceFree: t("admin.broadcast.audienceFree"),
          audiencePremium: t("admin.broadcast.audiencePremium"),
          channels: t("admin.broadcast.channels"),
          channelTelegram: t("admin.broadcast.channelTelegram"),
          channelApp: t("admin.broadcast.channelApp"),
          messagePlaceholder: t("admin.broadcast.messagePlaceholder"),
          send: t("admin.broadcast.send"),
          sending: t("admin.broadcast.sending"),
          test: t("admin.broadcast.test"),
          testing: t("admin.broadcast.testing"),
          sent: t("admin.broadcast.sent"),
          failed: t("admin.broadcast.failed"),
          messageRequired: t("admin.broadcast.messageRequired"),
        }}
      />
    </div>
  );
}