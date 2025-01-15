import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/middleware'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'src/middleware.ts'
})

export async function middleware(request: NextRequest) {
  logger.info('Starting middleware')
  logger.time('middleware')
  const result = await updateSession(request)
  logger.timeEnd('middleware')
  return result
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
