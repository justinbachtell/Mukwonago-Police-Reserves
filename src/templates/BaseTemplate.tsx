'use client'
import { NavigationSidebarWrapper } from '@/components/NavigationSidebarWrapper'
import { Toaster } from '@/components/ui/toaster'
import { UserContext } from '@/components/auth/UserContext'
import { useContext } from 'react'
import Link from 'next/link'
import type { Route } from 'next'

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
        <div className='flex min-w-0 flex-1 flex-col text-gray-900 dark:text-white'>
          <main className='flex-1 overflow-y-auto bg-gradient-to-br from-white to-blue-50/60 pt-14 text-gray-900 dark:bg-gradient-to-b dark:from-gray-950 dark:to-blue-950/40 dark:text-white lg:pt-0'>
            {props.children}
          </main>
          <footer className='shrink-0 border-t border-gray-300 px-4 py-2 text-center text-sm dark:border-gray-800 lg:py-4'>
            <div className='flex flex-col justify-center gap-0 lg:gap-2'>
              <div className='flex flex-row flex-wrap items-center justify-center gap-1 lg:flex-col lg:flex-nowrap lg:gap-2'>
                <p className='text-xs text-muted-foreground dark:text-gray-300 lg:text-sm'>
                  © Copyright {new Date().getFullYear()} Village of Mukwonago
                  Police Department. Built by{' '}
                  <Link
                    href='https://justinbachtell.com'
                    className='text-xs text-primary hover:underline lg:text-sm'
                  >
                    Justin Bachtell
                  </Link>
                </p>
              </div>
              <div className='flex flex-row flex-wrap items-center justify-center gap-1 text-muted-foreground lg:gap-2'>
                <Link
                  href={'/terms' as Route}
                  className='text-xs text-primary hover:underline lg:text-sm'
                >
                  Terms of Service
                </Link>
                {' • '}
                <Link
                  href={'/privacy' as Route}
                  className='text-xs text-primary hover:underline lg:text-sm'
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
