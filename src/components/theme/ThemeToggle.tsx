'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Mount the component only once on the client side
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size='sidebar'
          variant='ghost'
          className='flex h-8 w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent/50 dark:hover:bg-gray-800'
        >
          <div className='relative size-4 shrink-0'>
            <Sun className='absolute size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0' />
            <Moon className='absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100' />
          </div>
          <span className='font-normal text-sidebar-foreground'>Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[200px]'>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className='mr-2 size-4' />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className='mr-2 size-4' />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className='mr-2 size-4' />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
