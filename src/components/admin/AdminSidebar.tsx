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
      title: "Users",
      url: "/admin/users",
    },
    {
      icon: Boxes,
      title: "Equipment",
      url: "/admin/equipment",
    },
    {
      icon: ClipboardList,
      title: "Applications",
      url: "/admin/applications",
    },
    {
      icon: Calendar,
      title: "Events",
      url: "/admin/events",
    },
    {
      icon: FilePen,
      title: "Training",
      url: "/admin/training",
    },
  ],
  overview: [
    {
      icon: LayoutDashboard,
      name: "Dashboard",
      url: "/admin/dashboard",
    },
  ],
  settings: [
    {
      icon: Settings,
      title: "Settings",
      url: "/admin/settings",
    },
  ],
};

type AdminSidebarProps = {
  ref?: React.RefObject<HTMLDivElement>
} & Omit<React.ComponentProps<typeof Sidebar>, 'ref'>

function AdminSidebar(props: AdminSidebarProps) {
  return (
    // @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern
    <Sidebar {...props} className="absolute left-0 top-0 h-screen">
      {/* @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern */}
      <SidebarHeader className="border-b border-border px-2 py-4">
        {/* @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern */}
        <SidebarMenu>
          {/* @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern */}
          <SidebarMenuItem>
            <DropdownMenu>
              {/* @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern */}
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Portal</span>
                </div>
              </SidebarMenuButton>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern */}
      <SidebarContent>
        {/* @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern */}
        <SidebarGroup title="Overview">
          {/* @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern */}
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          {/* @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern */}
          <SidebarMenu>
            {sidebarItems.overview.map(item => (
              // @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern
              <SidebarMenuItem key={item.name}>
                {/* @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern */}
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

        {/* @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern */}
        <SidebarGroup title="Management">
          {/* @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern */}
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          {/* @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern */}
          <SidebarMenu>
            {sidebarItems.management.map(item => (
              // @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern
              <SidebarMenuItem key={item.title}>
                {/* @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern */}
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

      {/* @ts-ignore - TODO: Update sidebar component to use new React 19 ref pattern */}
      <SidebarFooter className="border-t border-border p-4">
        <SignOutButton>
          <button
            type="button"
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm',
              'text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            )}
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </button>
        </SignOutButton>
      </SidebarFooter>
    </Sidebar>
  );
}

export { AdminSidebar };
