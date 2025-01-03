import { getCurrentUser } from '@/actions/user';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { SignOutButton } from '@clerk/nextjs';
import {
  Calendar,
  FilePen,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Shield,
  User
} from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function UserLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'UserLayout',
  });

  // Get user roles
  const user = await getCurrentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  return (
    <BaseTemplate
      leftNav={
        <>
          <li className='flex list-none justify-start'>
            <Link
              href='/user/dashboard/'
              className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
            >
              <LayoutDashboard className='size-4' />
              <span>{t('dashboard_link')}</span>
            </Link>
          </li>
          {(user.role === 'admin' || user.role === 'member') && (
            <>
              <li className='flex list-none justify-start'>
                <Link
                  href='/contacts'
                  className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                >
                  <Mail className='size-4' />
                  <span>{t('contacts_link')}</span>
                </Link>
              </li>
              <li className='flex list-none justify-start'>
                <Link
                  href='/events'
                  className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                >
                  <Calendar className='size-4' />
                  <span>{t('events_link')}</span>
                </Link>
              </li>
              <li className='flex list-none justify-start'>
                <Link
                  href='/training'
                  className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                >
                  <FilePen className='size-4' />
                  <span>{t('training_link')}</span>
                </Link>
              </li>
              <li className='flex list-none justify-start'>
                <Link
                  href='/policies'
                  className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                >
                  <FilePen className='size-4' />
                  <span>{t('policies_link')}</span>
                </Link>
              </li>
            </>
          )}
          {user.role === 'admin' && (
            <li className='flex list-none justify-start'>
              <Link
                href='/admin/users'
                className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              >
                <Shield className='size-4' />
                <span>{t('admin_link')}</span>
              </Link>
            </li>
          )}
        </>
      }
      rightNav={
        <>
          <li className='flex list-none justify-start'>
            <Link
              href='/user/profile'
              className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
            >
              <User className='size-4' />
              <span>{t('profile_link')}</span>
            </Link>
          </li>
          <li className='flex list-none justify-start'>
            <Link
              href='/user/settings'
              className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
            >
              <Settings className='size-5' />
              <span>{t('settings_link')}</span>
            </Link>
          </li>
          <li className='flex list-none justify-start'>
            <SignOutButton>
              <button
                className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                type='button'
              >
                <LogOut className='size-4' />
                <span>{t('sign_out')}</span>
              </button>
            </SignOutButton>
          </li>
        </>
      }
    >
      {props.children}
    </BaseTemplate>
  )
}
