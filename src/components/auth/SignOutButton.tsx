'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/client'

const logger = createLogger({
  module: 'auth',
  file: 'SignOutButton.tsx'
})

export function SignOutButton() {
  const supabase = createClient()

  const handleSignOut = async () => {
    logger.info('Sign out initiated', undefined, 'handleSignOut')
    logger.time('sign-out-process')

    try {
      // Sign out from Supabase with global scope
      const { error } = await supabase.auth.signOut({
        scope: 'global'
      })

      if (error) {
        logger.error(
          'Sign out failed',
          {
            error: error.message
          },
          'handleSignOut'
        )
        toast.error('Failed to sign out')
        throw error
      }

      // Clear any client-side state and force a full page reload
      // This ensures all React contexts and client state are cleared
      window.location.href = '/'

      logger.info(
        'Sign out successful',
        {
          redirectTo: '/'
        },
        'handleSignOut'
      )

      toast.success('Successfully signed out')
    } catch (error) {
      logger.error(
        'Unexpected error during sign out',
        logger.errorWithData(error),
        'handleSignOut'
      )
      toast.error('An unexpected error occurred')
    } finally {
      logger.timeEnd('sign-out-process')
    }
  }

  return (
    <Button
      size='sm'
      variant='ghost'
      className='w-full justify-start gap-3 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground'
      onClick={handleSignOut}
    >
      <LogOut className='size-4 shrink-0' />
      Sign Out
    </Button>
  )
}
