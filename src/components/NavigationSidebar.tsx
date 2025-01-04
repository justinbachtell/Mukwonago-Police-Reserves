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
  Bot,
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
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import type { DBUser } from '@/types/user'

type NavigationSidebarProps = {
  ref?: React.RefObject<HTMLDivElement>
  user: DBUser | null
  signOutButton?: React.ReactNode
} & Omit<React.ComponentProps<typeof Sidebar>, 'ref'>

function NavigationSidebar({
  user,
  signOutButton,
  ...props
}: NavigationSidebarProps) {
  const t = useTranslations('NavigationSidebar')

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'
  const isMember = user?.role === 'member'

  const sidebarItems = {
    overview: [
      {
        icon: Home,
        title: t('home_link'),
        url: '/'
      },
      {
        icon: Bot,
        title: t('about_link'),
        url: '/about'
      }
    ],
    auth: isAuthenticated
      ? [
          {
            icon: LayoutDashboard,
            title: t('dashboard_link'),
            url: '/user/dashboard'
          },
          ...(isAdmin || isMember
            ? [
                {
                  icon: Mail,
                  title: t('contacts_link'),
                  url: '/contacts'
                },
                {
                  icon: Calendar,
                  title: t('events_link'),
                  url: '/events'
                },
                {
                  icon: FilePen,
                  title: t('training_link'),
                  url: '/training'
                },
                {
                  icon: FilePen,
                  title: t('policies_link'),
                  url: '/policies'
                }
              ]
            : [])
        ]
      : [
          {
            icon: CircleUserRound,
            title: t('sign_in_link'),
            url: '/sign-in'
          },
          {
            icon: NotebookPen,
            title: t('apply_now_link'),
            url: '/sign-up'
          }
        ],
    admin: isAdmin
      ? [
          {
            icon: Shield,
            title: t('admin_dashboard_link'),
            url: '/admin/dashboard'
          },
          {
            icon: Users,
            title: t('users_link'),
            url: '/admin/users'
          },
          {
            icon: Boxes,
            title: t('equipment_link'),
            url: '/admin/equipment'
          },
          {
            icon: ClipboardList,
            title: t('applications_link'),
            url: '/admin/applications'
          },
          {
            icon: Calendar,
            title: t('events_link'),
            url: '/admin/events'
          },
          {
            icon: Presentation,
            title: t('training_link'),
            url: '/admin/training'
          },
          {
            icon: FilePen,
            title: t('policies_link'),
            url: '/admin/policies'
          }
        ]
      : [],
    userSettings: isAuthenticated
      ? [
          {
            icon: User,
            title: t('profile_link'),
            url: '/user/profile'
          },
          {
            icon: Settings,
            title: t('settings_link'),
            url: '/user/settings'
          }
        ]
      : []
  }

  return (
    <Sidebar {...props} className='absolute left-0 top-0 h-screen'>
      <SidebarHeader className='border-b border-border px-2 py-4'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href='/'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                  <Shield className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='flex flex-wrap font-semibold'>
                    Mukwonago Police Reserves
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup title='Overview'>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {sidebarItems.overview.map(item => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon className='size-4' />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {sidebarItems.auth.length > 0 && (
          <SidebarGroup title='Navigation'>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              {sidebarItems.auth.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className='size-4' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {isAdmin && (
          <SidebarGroup title='Admin'>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenu>
              {sidebarItems.admin.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className='size-4' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {sidebarItems.userSettings.length > 0 && (
          <SidebarGroup title='User Settings'>
            <SidebarGroupLabel>User Settings</SidebarGroupLabel>
            <SidebarMenu>
              {sidebarItems.userSettings.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className='size-4' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      {isAuthenticated && signOutButton && (
        <SidebarFooter className='border-t border-border p-4'>
          {signOutButton}
        </SidebarFooter>
      )}
    </Sidebar>
  )
}

export { NavigationSidebar }
