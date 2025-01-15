import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'src/lib/middleware.ts'
})

export const updateSession = async (request: NextRequest) => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error('Missing Supabase environment variables')
  }

  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    logger.info('Starting updateSession')
    logger.time('updateSession')
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers
      }
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({
              request
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          }
        }
      }
    )

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser()

    const unprotectedPaths = [
      '/sign-in',
      '/sign-up',
      '/forgot-password',
      '/reset-password',
      '/error',
      '/unauthorized',
      '/404',
      '/monitoring',
      '/magic-link',
      '/verify-mfa'
    ]

    const isSupabaseAuthRoute = (pathname: string) => {
      return (
        pathname.startsWith('/auth/') ||
        pathname.startsWith('/rest/') ||
        pathname.includes('supabase')
      )
    }

    if (isSupabaseAuthRoute(request.nextUrl.pathname)) {
      logger.info('Bypassing middleware for Supabase auth route', {
        path: request.nextUrl.pathname
      })
      return NextResponse.next()
    }

    if (!unprotectedPaths.includes(request.nextUrl.pathname) && user.error) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    logger.timeEnd('updateSession')
    return response
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    logger.error('Supabase client could not be created', { error: e })
    logger.timeEnd('updateSession')
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    })
  }
}
