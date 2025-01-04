'use client'

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar'
import { NavigationSidebar } from './NavigationSidebar'
import type { DBUser } from '@/types/user'
import { cn } from '@/lib/utils'

interface NavigationSidebarWrapperProps {
  user: DBUser | null
  signOutButton?: React.ReactNode
}

function NavigationSidebarContent({
  user,
  signOutButton
}: NavigationSidebarWrapperProps) {
  const { open } = useSidebar()

  return (
    <div className='flex'>
      <NavigationSidebar user={user} signOutButton={signOutButton} />
      <div
        className={cn(
          'fixed left-0 top-0 z-50 flex h-12 w-full items-center border-b border-border bg-background px-4 md:h-14',
          open ? 'md:left-[11rem]' : 'md:left-[4rem]'
        )}
      >
        <SidebarTrigger />
      </div>
      <SidebarInset className='w-full'>
        <div className='h-12 md:h-14' />
        <div className='flex-1' />
      </SidebarInset>
    </div>
  )
}

export function NavigationSidebarWrapper(props: NavigationSidebarWrapperProps) {
  return (
    <SidebarProvider>
      <NavigationSidebarContent {...props} />
    </SidebarProvider>
  )
}
