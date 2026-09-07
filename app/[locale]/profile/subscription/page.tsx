import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { requireAuth } from "@/lib/api/guard";
import { getSubscriptionStatus, getPaymentRequisites, type PaymentRequisite } from "@/lib/api/user";
import { CopyButton } from "@/components/profile/copy-button";
import { ReceiptUploader } from "@/components/profile/receipt-uploader";
import { SparkleIcon, ChevronLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return {
    title: `${t("subscription.title")} — ${t("brand")}`,
    robots: { index: false, follow: false },
  };
}

function formatDate(iso: string | null | undefined, locale: Locale): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function SubscriptionPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireAuth(locale, `/${locale}/profile/subscription`);
  const { t } = await getServerTranslation(locale);

  const currentContact = "Укажите контакт для ответа";

  let sub: Awaited<ReturnType<typeof getSubscriptionStatus>> | null = null;
  let requisites: PaymentRequisite[] = [];
  let error = false;

  try {
    [sub, requisites] = await Promise.all([getSubscriptionStatus(), getPaymentRequisites()]);
  } catch {
    error = true;
  }

  if (error || !sub) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-12">
        <p className="rounded-2xl border border-night-line p-8 text-center text-muted">
          {t("catalog.listError")}
        </p>
      </section>
    );
  }

  const endDate = formatDate(sub.subscription_end, locale);

  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href={`/${locale}/profile`}
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        {t("profile.title")}
      </Link>

      <div className="mt-5 flex items-center gap-4 rounded-2xl border border-night-line bg-night/60 p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <SparkleIcon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-lg font-semibold">{t("subscription.title")}</h1>
          <p
            className={`mt-0.5 text-sm font-medium ${
              sub.is_premium ? "text-accent" : "text-muted"
            }`}
          >
            {sub.is_premium
              ? endDate
                ? t("profile.premiumUntil", { date: endDate })
                : t("subscription.planActive")
              : t("subscription.planFree")}
          </p>
        </div>
      </div>

      {sub.is_premium ? (
        <p className="mt-6 text-sm leading-6 text-muted">{t("subscription.planFreeText")}</p>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {t("subscription.price")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">{t("subscription.howTo")}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {t("subscription.requisitesTitle")}
            </h2>

            {(() => {
              const holder = requisites.find((r) => r.holder)?.holder ?? null;
              return (
                <div className="mt-3">
                  {holder && (
                    <p className="text-sm text-muted">{t("subscription.requisitesHolder", { holder })}</p>
                  )}
                  <div className="mt-3 flex flex-col gap-2.5">
                    {requisites.length > 0 ? (
                      requisites.map((req) => (
                        <div key={req.bank} className="flex flex-col gap-1.5">
                          <p className="text-sm font-medium">{req.bank}</p>
                          <CopyButton
                            value={req.card}
                            labels={{
                              copyHint: t("subscription.requisitesCopyHint"),
                              copied: t("subscription.requisitesCopied"),
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted">{t("subscription.requisitesUnavailable")}</p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {t("subscription.payButton")}
            </h2>
            <div className="mt-3">
              <ReceiptUploader
                locale={locale}
                method={t("subscription.price")}
                amount="499"
                contact={currentContact}
                labels={{
                  payButton: t("subscription.payButton"),
                  uploading: t("subscription.uploading"),
                  payedToast: t("subscription.payedToast"),
                  error: t("subscription.error"),
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}