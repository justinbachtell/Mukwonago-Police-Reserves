'use client';

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';

export function AdminSidebarWrapper() {
  return (
    <SidebarProvider>
      <div className="flex">
        <AdminSidebar />
        <SidebarInset>
          <div className="flex h-14 items-center gap-0 px-1">
            <SidebarTrigger />
            <div className="flex-1" />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
