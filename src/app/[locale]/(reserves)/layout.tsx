import { routing } from '@/libs/i18nNavigation'
import { BaseTemplate } from '@/templates/BaseTemplate'
import { enUS, esES } from '@clerk/localizations'
import { ClerkProvider, SignOutButton } from '@clerk/nextjs'
import {
  FilePen,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  User,
  Calendar
} from 'lucide-react'
import { getCurrentUser } from '@/actions/user'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ReservesLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  setRequestLocale(locale)
  const t = await getTranslations({
    locale,
    namespace: 'ReservesLayout'
  })

  let clerkLocale = enUS
  let signInUrl = '/sign-in'
  let signUpUrl = '/sign-up'
  let dashboardUrl = '/user/dashboard'
  let afterSignOutUrl = '/'

  if (locale === 'es') {
    clerkLocale = esES
  }

  if (locale !== routing.defaultLocale) {
    signInUrl = `/${locale}${signInUrl}`
    signUpUrl = `/${locale}${signUpUrl}`
    dashboardUrl = `/${locale}${dashboardUrl}`
    afterSignOutUrl = `/${locale}${afterSignOutUrl}`
  }

  // Get user roles
  const user = await getCurrentUser()

  if (!user) {
    return redirect('/sign-in')
  }

  if (
    user.role !== 'member' &&
    user.role !== 'admin' &&
    user.position === 'candidate'
  ) {
    return redirect('/user/dashboard')
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
        leftNav={
          <>
            <li className='flex justify-start list-none'>
              <Link
                href='/user/dashboard'
                className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              >
                <LayoutDashboard className='size-4' />
                <span>{t('dashboard_link')}</span>
              </Link>
            </li>
            <li className='flex justify-start list-none'>
              <Link
                href='/contacts'
                className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              >
                <FilePen className='size-4' />
                <span>{t('contacts_link')}</span>
              </Link>
            </li>
            <li className='flex justify-start list-none'>
              <Link
                href='/events'
                className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              >
                <Calendar className='size-4' />
                <span>{t('events_link')}</span>
              </Link>
            </li>
            <li className='flex justify-start list-none'>
              <Link
                href='/training'
                className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              >
                <FilePen className='size-4' />
                <span>{t('training_link')}</span>
              </Link>
            </li>
            <li className='flex justify-start list-none'>
              <Link
                href='/policies'
                className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              >
                <FilePen className='size-4' />
                <span>{t('policies_link')}</span>
              </Link>
            </li>
            {user.role === 'admin' && (
              <li className='flex justify-start list-none'>
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
            <li className='flex justify-start list-none'>
              <Link
                href='/user/profile'
                className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              >
                <User className='size-4' />
                <span>{t('profile_link')}</span>
              </Link>
            </li>
            <li className='flex justify-start list-none'>
              <Link
                href='/user/settings'
                className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              >
                <Settings className='size-5' />
                <span>{t('settings_link')}</span>
              </Link>
            </li>
            <li className='flex justify-start list-none'>
              <SignOutButton>
                <button
                  className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                  type='button'
                >
                  <LogOut className='size-4' />
                  <span>{t('sign_out_link')}</span>
                </button>
              </SignOutButton>
            </li>
          </>
        }
      >
        <div className='[&_p]:my-6'>{props.children}</div>
      </BaseTemplate>
    </ClerkProvider>
  )
}
