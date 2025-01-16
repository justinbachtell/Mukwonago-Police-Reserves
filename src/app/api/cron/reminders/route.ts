import { NextResponse } from 'next/server'
import { processAllReminders } from '@/lib/reminders'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'api',
  file: 'cron/reminders/route.ts'
})

// This route will be called by a cron job every hour
export async function GET() {
  logger.info('Processing reminders via cron', undefined, 'GET')

  try {
    const result = await processAllReminders()

    if (result) {
      logger.info('Reminders processed successfully', undefined, 'GET')
      return NextResponse.json({ success: true })
    } else {
      logger.error('Failed to process reminders', undefined, 'GET')
      return NextResponse.json(
        { error: 'Failed to process reminders' },
        { status: 500 }
      )
    }
  } catch (error) {
    logger.error(
      'Error processing reminders',
      logger.errorWithData(error),
      'GET'
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
