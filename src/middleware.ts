import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'middleware.ts'
})

export async function middleware(request: NextRequest) {
  try {
    logger.info('Processing middleware request', {
      path: request.nextUrl.pathname,
      method: request.method
    })

    // Create a response object that we can modify
    const response = NextResponse.next({
      request: {
        headers: request.headers
      }
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options
            })
          },
          remove(name: string, options: any) {
            response.cookies.set({
              name,
              value: '',
              ...options
            })
          }
        }
      }
    )

    const {
      data: { session }
    } = await supabase.auth.getSession()

    // Log session status
    logger.info('Session status', {
      hasSession: !!session,
      path: request.nextUrl.pathname
    })

    // Public routes that don't require authentication
    const publicRoutes = ['/sign-in', '/sign-up', '/']
    const isPublicRoute = publicRoutes.some(
      route =>
        request.nextUrl.pathname === route ||
        request.nextUrl.pathname.startsWith(`${route}/`)
    )

    // Static assets and API routes should pass through
    const isStaticOrApi = request.nextUrl.pathname.match(
      /^\/(_next|api|favicon\.ico|public)/
    )

    if (isStaticOrApi) {
      logger.info('Allowing static/api route', {
        path: request.nextUrl.pathname
      })
      return response
    }

    if (isPublicRoute) {
      logger.info('Processing public route', {
        path: request.nextUrl.pathname
      })
      // If user is already logged in and trying to access auth pages, redirect to dashboard
      if (
        session &&
        (request.nextUrl.pathname === '/sign-in' ||
          request.nextUrl.pathname === '/sign-up')
      ) {
        logger.info(
          'Redirecting authenticated user from auth page to dashboard'
        )
        return NextResponse.redirect(new URL('/user/dashboard', request.url))
      }
      return response
    }

    // Protected routes check
    if (!session) {
      logger.warn(
        'Unauthorized access attempt',
        {
          path: request.nextUrl.pathname
        },
        'middleware'
      )
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // User is authenticated and accessing a protected route
    logger.info('Allowing authenticated access', {
      path: request.nextUrl.pathname
    })
    return response
  } catch (error) {
    logger.error('Middleware error', logger.errorWithData(error), 'middleware')
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)'
  ]
}
