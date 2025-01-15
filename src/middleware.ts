import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/middleware'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'src/middleware.ts'
})

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Handle Supabase auth routes
  if (pathname.startsWith('/auth/v1/')) {
    logger.info('Handling Supabase auth route', { pathname })
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      logger.error('Missing NEXT_PUBLIC_SUPABASE_URL')
      return new Response('Internal Server Error', { status: 500 })
    }

    // Construct the full Supabase URL with query parameters
    const targetUrl = new URL(pathname, supabaseUrl)
    searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value)
    })

    logger.info('Redirecting to Supabase auth endpoint', {
      from: pathname,
      to: targetUrl.toString()
    })

    return Response.redirect(targetUrl)
  }

  // Skip middleware for specific paths
  if (
    pathname.startsWith('/_next/') || // Next.js resources
    pathname.startsWith('/api/') || // API routes
    pathname.startsWith('/auth/callback') || // Auth callback route
    pathname.includes('.') || // Static files
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy')
  ) {
    logger.info('Skipping middleware for path', { pathname })
    return
  }

  logger.info('Starting middleware', { pathname })
  logger.time('middleware')
  const result = await updateSession(request)
  logger.timeEnd('middleware')
  return result
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/auth/:path*'
  ]
}
