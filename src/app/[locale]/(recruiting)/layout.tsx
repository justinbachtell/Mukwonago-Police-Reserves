import { BaseTemplate } from '@/templates/BaseTemplate';
import { Bot, CircleUserRound, Home, NotebookPen } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export default async function RecruitingLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'RecruitingLayout',
  });

  return (
    <BaseTemplate
      leftNav={(
        <>
          <li className='flex justify-start list-none'>
            <Link
              href='/'
              className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              title='Home'
            >
              <Home className='size-4' />
              <span>{t('home_link')}</span>
            </Link>
          </li>
          <li className='flex justify-start list-none'>
            <Link
              href='/about'
              className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              title='About'
            >
              <Bot className='size-4' />
              <span>{t('about_link')}</span>
            </Link>
          </li>
        </>
      )}
      rightNav={(
        <>
          <li className='flex justify-start list-none'>
            <Link
              href='/sign-up'
              className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              title='Apply Now'
            >
              <NotebookPen className='size-4' />
              <span>{t('apply_now_link')}</span>
            </Link>
          </li>
          <li className='flex justify-start list-none'>
            <Link
              href='/sign-in'
              className='flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              title='Sign in'
            >
              <CircleUserRound className='size-5' />
              <span>{t('sign_in_link')}</span>
            </Link>
          </li>
        </>
      )}
    >
      <div className='[&_p]:my-6'>{props.children}</div>
    </BaseTemplate>
  )
}
