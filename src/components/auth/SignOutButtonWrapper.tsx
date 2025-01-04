'use client'

import { SignOutButton } from '@clerk/nextjs'
import { LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function SignOutButtonWrapper() {
  const t = useTranslations('NavigationSidebar')

  return (
    <SignOutButton>
      <button
        type='button'
        className='flex w-full items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
      >
        <LogOut className='size-4' />
        <span>{t('sign_out')}</span>
      </button>
    </SignOutButton>
  )
}
