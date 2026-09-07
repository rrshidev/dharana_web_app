import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { AuthForm, type AuthFormLabels } from "@/components/auth/auth-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getServerTranslation(locale);
  return { title: `${t("auth.registerTitle")} — ${t("brand")}` };
}

export default async function RegisterPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const sp = await searchParams;
  const nextUrl =
    sp.next && sp.next.startsWith(`/${locale}`) ? sp.next : undefined;

  const { t } = await getServerTranslation(locale);
  const labels: AuthFormLabels = {
    emailLabel: t("auth.emailLabel"),
    passwordLabel: t("auth.passwordLabel"),
    nameLabel: t("auth.nameLabel"),
    submitLabel: t("auth.create"),
    switchText: t("auth.hasAccount"),
    switchHref: `/${locale}/login`,
    switchLabel: t("auth.goLogin"),
    emailRequired: t("auth.emailRequired"),
    passwordRequired: t("auth.passwordRequired"),
    passwordTooShort: t("auth.passwordTooShort"),
    emailInvalid: t("auth.emailInvalid"),
    emailDisposable: t("auth.emailDisposable"),
    emailNotDeliverable: t("auth.emailNotDeliverable"),
    nameRequired: t("auth.nameRequired"),
    nameTooLong: t("auth.nameTooLong"),
    errorEmailRegistered: t("auth.errorEmailRegistered"),
    errorInvalid: t("auth.errorInvalid"),
    errorGeneric: t("auth.errorGeneric"),
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight">
        {t("auth.registerTitle")}
      </h1>
      <AuthForm locale={locale} mode="register" labels={labels} nextUrl={nextUrl} />
    </section>
  );
}