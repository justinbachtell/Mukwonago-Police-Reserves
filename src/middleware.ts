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
    '/((?!_next/static|_next/image|favicon.ico|site.webmanifest|auth/|rest/|storage/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
