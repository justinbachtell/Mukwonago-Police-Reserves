import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/middleware'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'src/middleware.ts'
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for specific paths
  if (
    pathname.startsWith('/_next/') || // Next.js resources
    pathname.startsWith('/api/') || // API routes
    pathname.startsWith('/auth/') || // Auth routes
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
     * - auth endpoints
     */
    '/((?!_next/static|_next/image|favicon.ico|public|auth/|api/|sign-in|sign-up|terms|privacy|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
