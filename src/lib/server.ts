import { withAuthErrorHandling } from '@/lib/auth-error'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'server.ts'
})

export async function createClient() {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            logger.error(
              'Failed to set cookies',
              logger.errorWithData(error),
              'createClient'
            )
          }
        }
      }
    }
  )

  return client
}

// Example of using the error handling
export async function getSession() {
  const supabase = await createClient()

  return withAuthErrorHandling(async () => {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()
    if (error) {
      throw error
    }
    return session
  }, 'getSession')
}
