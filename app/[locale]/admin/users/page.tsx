import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { requireAuth } from "@/lib/api/guard";
import { getProfile } from "@/lib/api/user";
import { getAdminUsers } from "@/lib/api/admin";
import type { AdminUserRow } from "@/lib/api/admin";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

async function assertAdmin(locale: string): Promise<boolean> {
  try {
    await requireAuth(locale, `/${locale}/admin`);
    return Boolean((await getProfile())?.is_admin);
  } catch {
    return false;
  }
}

export default async function AdminUsersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (!(await assertAdmin(locale))) notFound();

  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";

  const { t } = await getServerTranslation(locale);

  let items: AdminUserRow[] = [];
  let total = 0;
  try {
    const list = await getAdminUsers(q, 200);
    items = list.items;
    total = list.total;
  } catch {
    // пустой список
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">{t("admin.users.title")}</h1>
        <span className="text-xs text-muted">
          {t("admin.users.found").replace("%count%", String(total))}
        </span>
      </div>

      <form method="get" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={t("admin.users.searchPlaceholder")}
          className="w-full max-w-sm rounded-xl border border-night-line bg-night/60 px-4 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
        />
        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-night"
        >
          {t("admin.users.search")}
        </button>
      </form>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-night-line p-8 text-center text-sm text-muted">
          {t("admin.users.empty")}
        </p>
      ) : (
        <ul className="divide-y divide-night-line rounded-2xl border border-night-line bg-night/40">
          {items.map((u) => (
            <li key={u.id}>
              <Link
                href={`/${locale}/admin/users/${u.id}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 transition-colors hover:bg-white/[0.03]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {u.name || u.email || (u.username ? `@${u.username}` : "#" + u.id)}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {[u.email, u.username ? `@${u.username}` : null]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  {u.is_premium && (
                    <Badge tone="sage">{t("admin.users.premium")}</Badge>
                  )}
                  {u.is_banned && <Badge tone="danger">{t("admin.users.banned")}</Badge>}
                  {u.is_deleted && <Badge tone="danger">{t("admin.users.deleted")}</Badge>}
                </div>
                <div className="w-32 shrink-0 text-right text-xs text-muted">
                  <p>
                    {t("admin.users.minutes").replace("%min%", String(Math.round(u.total_practice_minutes)))}
                  </p>
                  <p>{t("admin.users.days").replace("%days%", String(u.total_practice_days))}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Badge({ tone, children }: { tone: "sage" | "danger"; children: React.ReactNode }) {
  const cls =
    tone === "sage"
      ? "bg-sage/15 text-sage"
      : "bg-[#e85d5d]/15 text-[#e85d5d]";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}