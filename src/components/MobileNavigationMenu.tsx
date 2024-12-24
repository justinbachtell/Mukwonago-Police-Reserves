'use client';

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

type MobileNavigationMenuProps = {
  leftNav?: React.ReactNode;
  rightNav?: React.ReactNode;
};

export function MobileNavigationMenu({ leftNav, rightNav }: MobileNavigationMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sheet when pathname changes (i.e., when navigating)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
      <SheetTrigger asChild className="md:hidden">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <span className="sr-only">Open menu</span>
          <Menu className="size-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex h-full flex-col justify-between">
          {leftNav && (
            <div className="space-y-1 py-4">
              <ul className="flex flex-col items-start justify-start space-y-1">{leftNav}</ul>
            </div>
          )}
          {rightNav && (
            <div className="space-y-1 border-t border-gray-300 py-4">
              <ul className="flex flex-col items-start justify-start space-y-1">{rightNav}</ul>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
