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
    <div className='flex h-screen flex-col overflow-hidden bg-white text-gray-700 antialiased dark:bg-gray-900'>
      <div className='flex h-full'>
        <NavigationSidebarWrapper
          user={user}
          signOutButton={props.signOutButton}
        />
        <div className='flex flex-1 flex-col'>
          <main className='flex-1 overflow-y-auto'>{props.children}</main>
          <footer className='border-t border-gray-300 px-4 py-6 text-center text-sm md:py-8'>
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
