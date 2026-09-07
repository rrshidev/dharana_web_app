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
  return { title: `${t("auth.loginTitle")} — ${t("brand")}` };
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
    errorEmailRegistered: t("auth.errorEmailRegistered"),
    errorInvalid: t("auth.errorInvalid"),
    errorGeneric: t("auth.errorGeneric"),
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight">
        {t("auth.loginTitle")}
      </h1>
      <AuthForm locale={locale} mode="login" labels={labels} nextUrl={nextUrl} />
    </section>
  );
}