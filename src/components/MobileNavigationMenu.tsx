'use client';

import { cn } from '@/lib/utils';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';

interface MobileNavigationMenuProps {
  leftNav?: React.ReactNode
  rightNav?: React.ReactNode
}

export function MobileNavigationMenu({ leftNav, rightNav }: MobileNavigationMenuProps) {
  return (
    <SheetPrimitive.Root>
      <SheetPrimitive.Trigger asChild>
        <button
          type='button'
          className='inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:hover:bg-gray-800 lg:hidden'
        >
          <span className='sr-only'>Open menu</span>
          <svg
            className='size-6'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 6h16M4 12h16M4 18h16'
            />
          </svg>
        </button>
      </SheetPrimitive.Trigger>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Title>Mobile Menu</SheetPrimitive.Title>
        <SheetPrimitive.Content
          className={cn(
            'fixed inset-y-0 left-0 z-50 h-full w-[300px] gap-4 border-r bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:w-[400px]'
          )}
        >
          <nav className='flex h-full flex-col justify-between'>
            {leftNav && <div className='space-y-1 py-4'>{leftNav}</div>}
            {rightNav && (
              <div className='space-y-1 border-t border-gray-200 py-4'>
                {rightNav}
              </div>
            )}
          </nav>
          <SheetPrimitive.Close className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none'>
            <span className='sr-only'>Close</span>
          </SheetPrimitive.Close>
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  )
}
