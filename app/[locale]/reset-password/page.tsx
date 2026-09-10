import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import {
  ForgotPasswordForm,
  type ForgotPasswordLabels,
} from "@/components/auth/forgot-password-form";
import {
  ResetPasswordForm,
  type ResetPasswordLabels,
} from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return { title: `${t("resetPassword.title")} — ${t("brand")}`, robots: { index: false, follow: false } };
}

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { t } = await getServerTranslation(locale);
  const { token } = await searchParams;

  const hasToken = typeof token === "string" && token.length > 0;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight">
        {t("resetPassword.sendTitle")}
      </h1>
      {hasToken ? (
        <ResetPasswordForm
          token={token}
          locale={locale}
          labels={
            {
              title: t("resetPassword.title"),
              newPassword: t("resetPassword.newPassword"),
              confirmPassword: t("resetPassword.confirmPassword"),
              passwordRequired: t("resetPassword.passwordRequired"),
              passwordTooShort: t("resetPassword.passwordTooShort"),
              passwordsMismatch: t("resetPassword.passwordsMismatch"),
              submit: t("resetPassword.submit"),
              success: t("resetPassword.success"),
              successText: t("resetPassword.successText"),
              invalid: t("resetPassword.invalid"),
              invalidText: t("resetPassword.invalidText"),
              error: t("resetPassword.error"),
              requestAgain: t("resetPassword.requestAgain"),
              goLogin: t("resetPassword.goLogin"),
            } as ResetPasswordLabels
          }
        />
      ) : (
        <ForgotPasswordForm
          locale={locale}
          labels={
            {
              sendTitle: t("resetPassword.sendTitle"),
              sendText: t("resetPassword.sendText"),
              emailLabel: t("resetPassword.emailLabel"),
              emailRequired: t("resetPassword.emailRequired"),
              emailInvalid: t("resetPassword.emailInvalid"),
              sendButton: t("resetPassword.sendButton"),
              sent: t("resetPassword.sent"),
              sentHint: t("resetPassword.sentHint"),
              sendFailed: t("resetPassword.sendFailed"),
              frequency: t("resetPassword.frequency"),
              goLogin: t("resetPassword.goLogin"),
            } as ForgotPasswordLabels
          }
        />
      )}
    </section>
  );
}