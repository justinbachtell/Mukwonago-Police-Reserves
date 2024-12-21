import { BaseTemplate } from '@/templates/BaseTemplate';
import { SignOutButton } from '@clerk/nextjs';
import { Briefcase, FileText, LayoutDashboard, LogOut, Settings, Shield, User } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export default async function UserLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'UserLayout',
  });

  return (
    <BaseTemplate
      leftNav={(
        <>
          <li>
            <Link
              href="/user/dashboard/"
              className="flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <LayoutDashboard className="size-4" />
              <span>{t('dashboard_link')}</span>
            </Link>
          </li>
          <li>
            <Link
              href="/user/applications"
              className="flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <FileText className="size-4" />
              <span>{t('applications_link')}</span>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/users"
              className="flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Shield className="size-4" />
              <span>{t('admin_link')}</span>
            </Link>
          </li>
        </>
      )}
      rightNav={(
        <>
          <li>
            <Link
              href="/user/equipment"
              className="flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Briefcase className="size-4" />
              <span>{t('equipment_link')}</span>
            </Link>
          </li>
          <li>
            <Link
              href="/user/profile"
              className="flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <User className="size-4" />
              <span>{t('profile_link')}</span>
            </Link>
          </li>
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
                <span>{t('sign_out')}</span>
              </button>
            </SignOutButton>
          </li>
        </>
      )}
    >
      {props.children}
    </BaseTemplate>
  );
}
