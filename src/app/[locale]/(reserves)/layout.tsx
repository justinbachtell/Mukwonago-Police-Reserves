import { routing } from '@/libs/i18nNavigation';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { enUS, frFR } from '@clerk/localizations';
import { ClerkProvider, SignOutButton } from '@clerk/nextjs';
import { FilePen, Home, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export default async function ReservesLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'ReservesLayout',
  });

  let clerkLocale = enUS;
  let signInUrl = '/sign-in';
  let signUpUrl = '/sign-up';
  let dashboardUrl = '/user/dashboard';
  let afterSignOutUrl = '/';

  if (locale === 'fr') {
    clerkLocale = frFR;
  }

  if (locale !== routing.defaultLocale) {
    signInUrl = `/${locale}${signInUrl}`;
    signUpUrl = `/${locale}${signUpUrl}`;
    dashboardUrl = `/${locale}${dashboardUrl}`;
    afterSignOutUrl = `/${locale}${afterSignOutUrl}`;
  }

  return (
    <ClerkProvider
      localization={clerkLocale}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      signInFallbackRedirectUrl={dashboardUrl}
      signUpFallbackRedirectUrl={dashboardUrl}
      afterSignOutUrl={afterSignOutUrl}
    >
      <BaseTemplate
        leftNav={(
          <>
            <li>
              <Link
                href="/"
                className="flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                title="Home"
              >
                <Home className="size-4" />
                <span>{t('home_link')}</span>
              </Link>
            </li>
            <li>
              <Link
                href="/user/dashboard"
                className="flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <LayoutDashboard className="size-4" />
                <span>{t('dashboard_link')}</span>
              </Link>
            </li>
            <li>
              <Link
                href="/application"
                className="flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <FilePen className="size-4" />
                <span>{t('application_link')}</span>
              </Link>
            </li>
          </>
        )}
        rightNav={(
          <>
            <li>
              <Link
                href="/user/settings"
                className="flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Settings className="size-5" />
                <span>{t('settings_link')}</span>
              </Link>
            </li>
            <li>
              <SignOutButton>
                <button
                  className="flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  type="button"
                >
                  <LogOut className="size-4" />
                  <span>{t('sign_out_link')}</span>
                </button>
              </SignOutButton>
            </li>
          </>
        )}
      >
        <div className="[&_p]:my-6">
          {props.children}
        </div>
      </BaseTemplate>
    </ClerkProvider>
  );
}
