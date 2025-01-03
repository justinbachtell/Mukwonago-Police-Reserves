import { MobileNavigationMenu } from '@/components/MobileNavigationMenu'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { AppConfig } from '@/utils/AppConfig'
import { useTranslations } from 'next-intl'

export function BaseTemplate(props: {
  leftNav: React.ReactNode
  rightNav?: React.ReactNode
  sidebar?: React.ReactNode
  children: React.ReactNode
}) {
  const t = useTranslations('BaseTemplate')

  const content = (
    <div className='w-full text-gray-700 antialiased'>
      <div className='mx-auto'>
        <header className='border-b border-gray-300'>
          <div className='flex justify-end px-4 py-2 md:justify-between lg:px-8'>
            {/* Mobile Menu */}
            <MobileNavigationMenu
              leftNav={props.leftNav}
              rightNav={props.rightNav}
            />

            {/* Desktop Navigation */}
            <nav className='hidden md:flex md:flex-1'>
              <ul className='flex list-none flex-wrap gap-x-5 text-xl'>
                {props.leftNav}
              </ul>
            </nav>

            <nav className='hidden md:flex'>
              <ul className='flex list-none flex-wrap gap-x-5 text-xl'>
                {props.rightNav}
              </ul>
            </nav>
          </div>
        </header>

        <div className='relative flex h-full'>
          {props.sidebar && (
            <aside className='sticky top-0 h-full border-r'>
              {props.sidebar}
            </aside>
          )}

          <main className='flex-1 overflow-x-hidden'>{props.children}</main>
        </div>

        <footer className='border-t border-gray-300 px-4 py-8 text-center text-sm'>
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
      <Toaster />
    </div>
  )

  return props.sidebar ? <SidebarProvider defaultOpen>{content}</SidebarProvider> : content
}
