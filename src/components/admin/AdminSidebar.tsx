'use client';

import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { SignOutButton } from '@clerk/nextjs';
import {
  Boxes,
  Calendar,
  ClipboardList,
  FilePen,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import * as React from 'react';

const sidebarItems = {
  management: [
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
      icon: FilePen,
      title: 'Training',
      url: '/admin/training'
    },
    {
      icon: FilePen,
      title: 'Policies',
      url: '/admin/policies'
    }
  ],
  overview: [
    {
      icon: LayoutDashboard,
      name: 'Dashboard',
      url: '/admin/dashboard'
    }
  ],
  settings: [
    {
      icon: Settings,
      title: 'Settings',
      url: '/admin/settings'
    }
  ]
}

type AdminSidebarProps = {
  ref?: React.RefObject<HTMLDivElement>
} & Omit<React.ComponentProps<typeof Sidebar>, 'ref'>

function AdminSidebar(props: AdminSidebarProps) {
  return (
    <Sidebar {...props} className='absolute left-0 top-0 h-screen'>
      <SidebarHeader className='border-b border-border px-2 py-4'>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                  <Shield className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>Admin Portal</span>
                </div>
              </SidebarMenuButton>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup title='Overview'>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {sidebarItems.overview.map(item => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup title='Management'>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarMenu>
            {sidebarItems.management.map(item => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-t border-border p-4'>
        <SignOutButton>
          <button
            type='button'
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm',
              'text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            )}
          >
            <LogOut className='size-4' />
            <span>Sign Out</span>
          </button>
        </SignOutButton>
      </SidebarFooter>
    </Sidebar>
  )
}

export { AdminSidebar };
