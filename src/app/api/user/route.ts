import { getCurrentUser } from '@/actions/user'
import { createLogger } from '@/lib/debug'
import { NextResponse } from 'next/server'

const logger = createLogger({
  module: 'api',
  file: 'user/route.ts'
})

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      logger.warn('No user found', undefined, 'GET')
      return new NextResponse(null, { status: 401 })
    }

    logger.info('User data fetched successfully', { userId: user.id }, 'GET')
    return NextResponse.json(user)
  } catch (error) {
    logger.error(
      'Failed to fetch user data',
      logger.errorWithData(error),
      'GET'
    )
    return new NextResponse(null, { status: 500 })
  }
}
