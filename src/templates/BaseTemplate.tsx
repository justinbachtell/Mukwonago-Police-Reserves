'use client'
import { NavigationSidebarWrapper } from '@/components/NavigationSidebarWrapper'
import { Toaster } from '@/components/ui/toaster'
import { UserContext } from '@/components/auth/UserContext'
import { useContext } from 'react'

export function BaseTemplate(props: {
  children: React.ReactNode
  signOutButton?: React.ReactNode
}) {
  const user = useContext(UserContext)

  return (
    <div className='fixed inset-0 flex flex-col bg-white text-gray-700 antialiased dark:bg-gray-900'>
      <div className='flex flex-1 overflow-hidden'>
        <NavigationSidebarWrapper
          user={user}
          signOutButton={props.signOutButton}
        />
        <div className='flex min-w-0 flex-1 flex-col'>
          <main className='flex-1 overflow-y-auto px-4'>{props.children}</main>
          <footer className='shrink-0 border-t border-gray-300 px-4 py-6 text-center text-sm md:py-8'>
            {`© Copyright ${new Date().getFullYear()} Village of Mukwonago Police Department. Built by `}
            <a
              href='https://justinbachtell.com'
              className='text-blue-700 hover:border-b-2 hover:border-blue-700'
            >
              Justin Bachtell
            </a>
          </footer>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
