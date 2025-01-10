'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import {
  Boxes,
  Calendar,
  CircleUserRound,
  ClipboardList,
  FilePen,
  Home,
  LayoutDashboard,
  Mail,
  NotebookPen,
  Presentation,
  Settings,
  Shield,
  User,
  Users
} from 'lucide-react'
import Link from 'next/link'
import type { DBUser } from '@/types/user'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

type NavigationSidebarProps = {
  ref?: React.RefObject<HTMLDivElement>
  user: DBUser | null
  signOutButton?: React.ReactNode
} & Omit<React.ComponentProps<typeof Sidebar>, 'ref'>

function NavigationSidebar({
  user,
  signOutButton,
  className,
  ...props
}: NavigationSidebarProps) {
  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'
  const isMember = user?.role === 'member'
  const isActive = user?.status === 'active'
  const pathname = usePathname()

  const sidebarItems = {
    overview: [
      {
        icon: Home,
        title: 'Home',
        url: '/'
      }
    ],
    auth:
      isAuthenticated && isActive
        ? [
            {
              icon: LayoutDashboard,
              title: 'Dashboard',
              url: '/user/dashboard'
            },
            ...(isAdmin || isMember
              ? [
                  {
                    icon: Mail,
                    title: 'Contacts',
                    url: '/contacts'
                  },
                  {
                    icon: Calendar,
                    title: 'Events',
                    url: '/events'
                  },
                  {
                    icon: FilePen,
                    title: 'Training',
                    url: '/training'
                  },
                  {
                    icon: FilePen,
                    title: 'Policies',
                    url: '/policies'
                  }
                ]
              : [])
          ]
        : [
            {
              icon: CircleUserRound,
              title: 'Sign In',
              url: '/sign-in'
            },
            {
              icon: NotebookPen,
              title: 'Apply Now',
              url: '/sign-up'
            }
          ],
    admin:
      isAdmin && isActive
        ? [
            {
              icon: Shield,
              title: 'Dashboard',
              url: '/admin/dashboard'
            },
            {
              icon: Users,
              title: 'Users',
              url: '/admin/users'
            },
            {
              icon: Boxes,
              title: 'Equipment',
              url: '/admin/equipment'
            },
            {
              icon: ClipboardList,
              title: 'Applications',
              url: '/admin/applications'
            },
            {
              icon: Calendar,
              title: 'Events',
              url: '/admin/events'
            },
            {
              icon: Presentation,
              title: 'Training',
              url: '/admin/training'
            },
            {
              icon: FilePen,
              title: 'Policies',
              url: '/admin/policies'
            }
          ]
        : [],
    userSettings:
      isAuthenticated && isActive
        ? [
            {
              icon: User,
              title: 'Profile',
              url: '/user/profile'
            },
            {
              icon: Settings,
              title: 'Settings',
              url: '/user/settings'
            }
          ]
        : []
  }

  return (
    <Sidebar
      {...props}
      className={cn(
        'h-screen border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'fixed inset-y-0 left-0 z-50 w-[240px] lg:sticky lg:top-0',
        className
      )}
    >
      <SidebarHeader className='border-b p-4'>
        <Link href='/' className='flex items-center gap-3'>
          <div className='flex aspect-square size-8 items-center justify-center rounded-md border bg-background'>
            <Shield className='size-4 text-foreground' />
          </div>
          <div>
            <div className='text-sm'>Mukwonago Police</div>
            <div className='text-xs text-muted-foreground'>Reserves</div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className='px-2 py-4'>
        <div className='space-y-6'>
          <SidebarGroup>
            <SidebarGroupLabel className='mb-2 hidden px-3 text-xs uppercase text-muted-foreground'>
              Recruiting
            </SidebarGroupLabel>
            <SidebarMenu>
              {sidebarItems.overview.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent/50',
                      pathname === item.url && 'bg-accent/50'
                    )}
                  >
                    <Link href={item.url} className='flex items-center gap-3'>
                      <item.icon className='size-4 shrink-0' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className='mb-2 px-3 text-xs uppercase text-muted-foreground'>
              {isAuthenticated && isActive ? 'Reserves' : 'Authentication'}
            </SidebarGroupLabel>
            <SidebarMenu>
              {sidebarItems.auth.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent/50',
                      pathname === item.url && 'bg-accent/50'
                    )}
                  >
                    <Link href={item.url} className='flex items-center gap-3'>
                      <item.icon className='size-4 shrink-0' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {isAdmin && isActive && (
            <SidebarGroup>
              <SidebarGroupLabel className='mb-2 px-3 text-xs uppercase text-muted-foreground'>
                Admin
              </SidebarGroupLabel>
              <SidebarMenu>
                {sidebarItems.admin.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent/50',
                        pathname === item.url && 'bg-accent/50'
                      )}
                    >
                      <Link href={item.url} className='flex items-center gap-3'>
                        <item.icon className='size-4 shrink-0' />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          )}

          {isAuthenticated &&
            isActive &&
            sidebarItems.userSettings.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className='mb-2 px-3 text-xs uppercase text-muted-foreground'>
                  Settings
                </SidebarGroupLabel>
                <SidebarMenu>
                  {sidebarItems.userSettings.map(item => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent/50',
                          pathname === item.url && 'bg-accent/50'
                        )}
                      >
                        <Link
                          href={item.url}
                          className='flex items-center gap-3'
                        >
                          <item.icon className='size-4 shrink-0' />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            )}
        </div>
      </SidebarContent>

      {isAuthenticated && signOutButton && (
        <SidebarFooter className='border-t p-4'>{signOutButton}</SidebarFooter>
      )}
    </Sidebar>
  )
}

export { NavigationSidebar }
