import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'src/lib/middleware.ts'
})

export const updateSession = async (request: NextRequest) => {
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

    const publicRoutes = [
      '/',
      '/sign-in',
      '/sign-up',
      '/forgot-password',
      '/reset-password',
      '/magic-link',
      '/verify-mfa',
      '/monitoring',
      '/auth/callback',
      '/api/auth/callback',
      '/auth/v1/callback',
      '/api/auth/v1/callback',
      '/auth/v1/authorize',
      '/api/auth/v1/authorize',
      '/auth/v1/token',
      '/api/auth/v1/token',
      '/auth/v1/signup',
      '/api/auth/v1/signup',
      '/site.webmanifest',
      '/favicon.ico',
      '/apple-touch-icon.png',
      '/favicon-16x16.png',
      '/favicon-32x32.png',
      '/favicon-96x96.png',
      '/favicon-128x128.png',
      '/web-app-manifest-192x192.png',
      '/web-app-manifest-512x512.png',
      '/robots.txt',
      '/sitemap.xml'
    ]

    if (!publicRoutes.includes(request.nextUrl.pathname) && user.error) {
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
