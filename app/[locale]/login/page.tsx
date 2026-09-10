import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { AuthForm, type AuthFormLabels } from "@/components/auth/auth-form";
import { GoogleLogin, type GoogleLoginLabels } from "@/components/auth/google-login";
import { TelegramLogin, type TelegramLoginLabels } from "@/components/auth/telegram-login";
import { GOOGLE_CLIENT_ID } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return { title: `${t("auth.loginTitle")} — ${t("brand")}`, robots: { index: false, follow: false } };
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const sp = await searchParams;
  const nextUrl =
    sp.next && sp.next.startsWith(`/${locale}`) ? sp.next : undefined;

  const { t } = await getServerTranslation(locale);
  const labels: AuthFormLabels = {
    emailLabel: t("auth.emailLabel"),
    passwordLabel: t("auth.passwordLabel"),
    submitLabel: t("auth.enter"),
    switchText: t("auth.noAccount"),
    switchHref: `/${locale}/register`,
    switchLabel: t("auth.goRegister"),
    emailRequired: t("auth.emailRequired"),
    passwordRequired: t("auth.passwordRequired"),
    emailInvalid: t("auth.emailInvalid"),
    errorEmailRegistered: t("auth.errorEmailRegistered"),
    errorInvalid: t("auth.errorInvalid"),
    errorGeneric: t("auth.errorGeneric"),
    forgotHref: `/${locale}/reset-password`,
    forgotLabel: t("auth.forgotPassword"),
  };

  const tgLabels: TelegramLoginLabels = {
    or: t("auth.telegramOr"),
    button: t("auth.telegramButton"),
    title: t("auth.telegramTitle"),
    step1: t("auth.telegramStep1"),
    step2: t("auth.telegramStep2"),
    step3: t("auth.telegramStep3"),
    openBot: t("auth.telegramOpenBot"),
    codePlaceholder: t("auth.telegramCodePlaceholder"),
    login: t("auth.telegramLogin"),
    cancel: t("auth.telegramCancel"),
    codeRequired: t("auth.telegramCodeRequired"),
    invalid: t("auth.telegramInvalid"),
    expired: t("auth.telegramExpired"),
    failed: t("auth.telegramFailed"),
  };

  const googleLabels: GoogleLoginLabels = {
    or: t("auth.googleOr"),
    button: t("auth.googleButton"),
    failed: t("auth.googleFailed"),
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight">
        {t("auth.loginTitle")}
      </h1>
      <AuthForm locale={locale} mode="login" labels={labels} nextUrl={nextUrl} />
      <div className="mx-auto my-6 flex w-full max-w-sm items-center gap-3">
        <div className="h-px flex-1 bg-night-line" />
        <span className="text-xs text-muted">{t("auth.or")}</span>
        <div className="h-px flex-1 bg-night-line" />
      </div>
      <div className="space-y-3">
        {GOOGLE_CLIENT_ID ? (
          <GoogleLogin locale={locale} clientId={GOOGLE_CLIENT_ID} labels={googleLabels} nextUrl={nextUrl} hideDivider />
        ) : null}
        <TelegramLogin locale={locale} labels={tgLabels} nextUrl={nextUrl} hideDivider />
      </div>
    </section>
  );
}