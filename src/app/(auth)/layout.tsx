'use client'

import { createClient } from '@/lib/client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createLogger } from '@/lib/debug'
import { getCurrentUser } from '@/actions/user'
import { BaseTemplate } from '@/templates/BaseTemplate'
import { NotificationList } from '@/components/notifications/NotificationList'
import { LoadingPage } from '@/components/ui/loading'

const logger = createLogger({
  module: 'auth',
  file: 'layout.tsx'
})

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [_user, setUser] =
    useState<Awaited<ReturnType<typeof getCurrentUser>>>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info(
        'Auth state changed',
        { event, userId: session?.user?.id },
        'onAuthStateChange'
      )

      if (event === 'SIGNED_OUT') {
        setUser(null)
        setTimeout(() => {
          router.push('/')
        }, 100)
      } else if (event === 'SIGNED_IN') {
        const userData = await getCurrentUser()
        setUser(userData)
        // Only redirect to dashboard if we're on an auth page
        if (pathname === '/sign-in' || pathname === '/sign-up') {
          router.push('/user/dashboard')
        }
      }
    })

    // Initial user fetch
    getCurrentUser().then(userData => {
      setUser(userData)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase.auth, pathname])

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <BaseTemplate>
      <div className='py-8'>
        <NotificationList />
        {children}
      </div>
    </BaseTemplate>
  )
}
