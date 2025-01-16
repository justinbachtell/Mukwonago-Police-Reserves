'use server'

import { createTestNotification } from '@/actions/notification'
import { getCurrentUser } from '@/actions/user'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'test-notification',
  file: 'route.ts'
})

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data, error } = await createTestNotification(user.id)
    if (error) {
      return Response.json({ error }, { status: 500 })
    }

    return Response.json({ data })
  } catch (error) {
    logger.error(
      'Error creating test notification',
      logger.errorWithData(error),
      'POST'
    )
    return Response.json(
      { error: 'Failed to create test notification' },
      { status: 500 }
    )
  }
}
