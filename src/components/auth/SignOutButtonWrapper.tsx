'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/client'

const logger = createLogger({
  module: 'auth',
  file: 'SignOutButtonWrapper.tsx'
})

export function SignOutButtonWrapper() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    logger.info('Sign out initiated', undefined, 'handleSignOut')
    logger.time('sign-out-process')

    try {
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

      logger.info(
        'Sign out successful',
        {
          redirectTo: '/'
        },
        'handleSignOut'
      )

      router.push('/')
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
      variant='ghost'
      className='w-full justify-start'
      onClick={handleSignOut}
    >
      <LogOut className='mr-2 size-4' />
      Sign Out
    </Button>
  )
}
