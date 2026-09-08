import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { apiFetch, ApiError } from "@/lib/api/server";
import { MailIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return { title: `${t("verifyEmail.title")} — ${t("brand")}` };
}

export default async function VerifyEmailPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { t } = await getServerTranslation(locale);
  const { token } = await searchParams;

  let status: "success" | "invalid" | "error" = "error";

  if (token) {
    try {
      await apiFetch<{ ok: boolean }>(
        `/auth/verify-email?token=${encodeURIComponent(token)}`,
      );
      status = "success";
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        status = "invalid";
      }
    }
  }

  const copy = {
    success: {
      title: t("verifyEmail.success"),
      text: t("verifyEmail.successText"),
    },
    invalid: {
      title: t("verifyEmail.invalid"),
      text: t("verifyEmail.invalidText"),
    },
    error: {
      title: t("verifyEmail.error"),
      text: t("verifyEmail.errorText"),
    },
  }[status];

  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          status === "success" ? "bg-sage/15 text-sage" : "bg-accent/15 text-accent"
        }`}
      >
        {status === "success" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
            <path d="m4.5 12.5 5 5 10-11" />
          </svg>
        ) : (
          <MailIcon className="h-6 w-6" />
        )}
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">{copy.title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{copy.text}</p>
      <Link
        href={`/${locale}/profile`}
        className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-sage px-6 text-sm font-semibold text-night transition-colors hover:bg-sage/90"
      >
        {t("verifyEmail.goProfile")}
      </Link>
    </section>
  );
}