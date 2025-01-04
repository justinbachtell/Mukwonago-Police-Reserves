import { NavigationSidebarWrapper } from '@/components/NavigationSidebarWrapper'
import { Toaster } from '@/components/ui/toaster'
import { AppConfig } from '@/utils/AppConfig'
import type { DBUser } from '@/types/user'
import { useTranslations } from 'next-intl'

export function BaseTemplate(props: {
  children: React.ReactNode
  user: DBUser | null
  signOutButton?: React.ReactNode
}) {
  const t = useTranslations('BaseTemplate')

  return (
    <div className='flex min-h-screen flex-col bg-gray-50 text-gray-700 antialiased dark:bg-gray-900'>
      <div className='flex flex-1'>
        <NavigationSidebarWrapper
          user={props.user}
          signOutButton={props.signOutButton}
        />
        <div className='flex w-full flex-1 flex-col'>
          <main className='flex-1 px-4 pt-16 md:px-8 md:pt-20'>
            {props.children}
          </main>

          <footer className='border-t border-gray-300 px-4 py-6 text-center text-sm md:py-8'>
            {`© Copyright ${new Date().getFullYear()} ${AppConfig.name}. `}
            {t.rich('built_by', {
              author: () => (
                <a
                  href='https://justinbachtell.com'
                  className='text-blue-700 hover:border-b-2 hover:border-blue-700'
                >
                  Justin Bachtell
                </a>
              )
            })}
          </footer>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
