import { createClient } from '@/lib/server'
import { db } from '@/libs/DB'
import { user } from '@/models/Schema'
import { toISOString } from '@/lib/utils'
import { createLogger } from '@/lib/debug'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

const logger = createLogger({
  module: 'auth',
  file: 'auth/callback/route.ts'
})

export async function GET(request: Request) {
  logger.info('Processing auth callback', undefined, 'GET')
  logger.time('auth-callback')

  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/user/dashboard'

    if (!code) {
      logger.warn('No code provided in callback', undefined, 'GET')
      return NextResponse.redirect(new URL('/sign-in', requestUrl.origin))
    }

    const supabase = await createClient()

    // Exchange the code for a session
    logger.time('exchange-code')
    const {
      data: { session },
      error: exchangeError
    } = await supabase.auth.exchangeCodeForSession(code)
    logger.timeEnd('exchange-code')

    if (exchangeError) {
      logger.error(
        'Failed to exchange code for session',
        logger.errorWithData(exchangeError),
        'GET'
      )
      return NextResponse.redirect(new URL('/sign-in', requestUrl.origin))
    }

    if (!session?.user) {
      logger.warn('No user in exchanged session', undefined, 'GET')
      return NextResponse.redirect(new URL('/sign-in', requestUrl.origin))
    }

    // Check if user already exists in our database
    logger.time('check-user-exists')
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
    logger.timeEnd('check-user-exists')

    if (!existingUser) {
      // Create new user in our database
      logger.info(
        'Creating new user in database',
        { userId: session.user.id },
        'GET'
      )
      const now = toISOString(new Date())
      const userData = session.user.user_metadata

      const [newUser] = await db
        .insert(user)
        .values({
          id: session.user.id,
          email: session.user.email ?? '',
          first_name: userData.first_name ?? '',
          last_name: userData.last_name ?? '',
          created_at: now,
          updated_at: now,
          role: 'guest',
          position: 'reserve',
          status: 'active'
        })
        .returning()

      if (!newUser) {
        logger.error(
          'Failed to create new user',
          { userId: session.user.id },
          'GET'
        )
        return NextResponse.redirect(new URL('/sign-in', requestUrl.origin))
      }

      logger.info(
        'New user created successfully',
        { userId: newUser.id },
        'GET'
      )
    }

    logger.info(
      'Auth callback processed successfully',
      { userId: session.user.id },
      'GET'
    )
    logger.timeEnd('auth-callback')

    // Redirect to the next page
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  } catch (error) {
    logger.error(
      'Error processing auth callback',
      logger.errorWithData(error),
      'GET'
    )
    logger.timeEnd('auth-callback')
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
}
