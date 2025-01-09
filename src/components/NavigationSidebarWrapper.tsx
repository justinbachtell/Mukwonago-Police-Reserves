'use client'

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { NavigationSidebar } from './NavigationSidebar'
import type { DBUser } from '@/types/user'

interface NavigationSidebarWrapperProps {
  user: DBUser | null
  signOutButton?: React.ReactNode
}

function NavigationSidebarContent({
  user,
  signOutButton
}: NavigationSidebarWrapperProps) {
  return (
    <>
      <div className='fixed left-0 top-0 z-50 flex h-14 w-full items-center border-b border-border bg-background px-4 md:hidden'>
        <SidebarTrigger />
      </div>
      <NavigationSidebar user={user} signOutButton={signOutButton} />
    </>
  )
}

export function NavigationSidebarWrapper(props: NavigationSidebarWrapperProps) {
  return (
    <SidebarProvider>
      <NavigationSidebarContent {...props} />
    </SidebarProvider>
  )
}
