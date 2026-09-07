import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { requireAuth } from "@/lib/api/guard";
import { getProfile } from "@/lib/api/user";
import { getAdminAsanas, getAdminSequences } from "@/lib/api/admin";
import type { AdminAsana, AdminSequence } from "@/lib/api/admin";
import { getCategories } from "@/lib/api/catalog";
import type { Category } from "@/lib/api/catalog";
import { ContentPanel } from "@/components/admin/content-panel";
import { mediaUrl } from "@/lib/api/media";

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

export default async function AdminContentPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (!(await assertAdmin(locale))) notFound();

  const { t } = await getServerTranslation(locale);

  let asanas: AdminAsana[] = [];
  let sequences: AdminSequence[] = [];
  let categories: Category[] = [];
  try {
    [asanas, sequences, categories] = await Promise.all([
      getAdminAsanas().then((r) => r.items),
      getAdminSequences().then((r) => r.items),
      getCategories(),
    ]);
  } catch {
    // пустые списки
  }

  return (
    <ContentPanel
      locale={locale}
      asanas={asanas}
      sequences={sequences}
      categories={categories.map((c) => ({ id: c.id, name: c.display_name }))}
      mediaUrl={mediaUrl}
      labels={{
        tabAsanas: t("admin.content.tabAsanas"),
        tabSequences: t("admin.content.tabSequences"),
        search: t("admin.content.search"),
        empty: t("admin.content.empty"),
        addAsana: t("admin.content.addAsana"),
        asanaName: t("admin.content.asanaName"),
        category: t("admin.content.category"),
        difficulty: t("admin.content.difficulty"),
        effects: t("admin.content.effects"),
        video: t("admin.content.video"),
        photo: t("admin.content.photo"),
        upload: t("admin.content.upload"),
        uploading: t("admin.content.uploading"),
        delete: t("admin.content.delete"),
        cancel: t("admin.content.cancel"),
        save: t("admin.content.save"),
        saving: t("admin.content.saving"),
        description: t("admin.content.description"),
        edit: t("admin.content.edit"),
        addingSequence: t("admin.content.addingSequence"),
        addSequence: t("admin.content.addSequence"),
        sequenceName: t("admin.content.sequenceName"),
        section: t("admin.content.section"),
        free: t("admin.content.free"),
        premium: t("admin.content.premium"),
        confirmDelete: t("admin.content.confirmDelete"),
        actionFailed: t("admin.content.actionFailed"),
        uploadFailed: t("admin.content.uploadFailed"),
        fieldsRequired: t("admin.content.fieldsRequired"),
        openVideo: t("admin.content.openVideo"),
        fromApp: t("admin.content.fromApp"),
      }}
    />
  );
}