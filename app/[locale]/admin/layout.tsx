import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { requireAuth } from "@/lib/api/guard";
import { getProfile } from "@/lib/api/user";
import { AdminTabs } from "@/components/admin/admin-tabs";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminLayout({ children, params }: {
  children: React.ReactNode;
  params: Props["params"];
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireAuth(locale, `/${locale}/admin`);

  let isAdmin = false;
  try {
    const me = await getProfile();
    isAdmin = Boolean(me?.is_admin);
  } catch {
    // fall through to notFound
  }
  if (!isAdmin) notFound();

  const { t } = await getServerTranslation(locale);

  const tabs = [
    { key: "overview", label: t("admin.tabs.overview") },
    { key: "users", label: t("admin.tabs.users") },
    { key: "payments", label: t("admin.tabs.payments") },
    { key: "broadcast", label: t("admin.tabs.broadcast") },
    { key: "content", label: t("admin.tabs.content") },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <AdminTabs locale={locale} tabs={tabs} />
      <div className="mt-5">{children}</div>
    </section>
  );
}