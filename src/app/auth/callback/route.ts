import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'auth/callback/route.ts'
})

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/user/dashboard'
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')

    logger.info('Auth callback received', {
      hasCode: !!code,
      next,
      hasError: !!error,
      error_description,
      url: requestUrl.toString()
    })

    // Handle OAuth error parameters
    if (error || error_description) {
      logger.error('OAuth error in callback', {
        error,
        error_description,
        url: requestUrl.toString()
      })
      return NextResponse.redirect(
        new URL('/auth/auth-code-error', requestUrl.origin)
      )
    }

    if (!code) {
      logger.error('No code provided in callback', {
        searchParams: Object.fromEntries(requestUrl.searchParams),
        url: requestUrl.toString()
      })
      return NextResponse.redirect(
        new URL('/auth/auth-code-error', requestUrl.origin)
      )
    }

    const supabase = await createClient()

    logger.info('Exchanging code for session', { code })
    const {
      data: { session },
      error: exchangeError
    } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      logger.error('Failed to exchange code for session', {
        error: exchangeError,
        message: exchangeError.message,
        status: exchangeError.status,
        code
      })
      return NextResponse.redirect(
        new URL('/auth/auth-code-error', requestUrl.origin)
      )
    }

    // Get user metadata from the provider
    if (session?.user) {
      const metadata = session.user.user_metadata
      const firstName = metadata?.given_name || metadata?.first_name || ''
      const lastName = metadata?.family_name || metadata?.last_name || ''

      // Update Supabase user metadata
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName
        }
      })

      if (updateError) {
        logger.error('Failed to update user metadata', {
          error: updateError,
          userId: session.user.id,
          metadata: session.user.user_metadata,
          firstName,
          lastName
        })
      } else if (data.user) {
        logger.info('Successfully updated user metadata', {
          userId: data.user.id,
          metadata: data.user.user_metadata,
          firstName,
          lastName
        })

        // Update the database
        try {
          const { error: dbError } = await supabase
            .from('user')
            .update({
              first_name: firstName,
              last_name: lastName,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.user.id)

          if (dbError) {
            logger.error('Failed to update user in database', {
              error: dbError,
              userId: data.user.id,
              firstName,
              lastName
            })
          } else {
            logger.info('Successfully updated user in database', {
              userId: data.user.id,
              firstName,
              lastName
            })
          }
        } catch (dbError) {
          logger.error('Error updating user in database', {
            error: dbError,
            userId: data.user.id,
            firstName,
            lastName
          })
        }
      }
    }

    logger.info('Successfully exchanged code for session', {
      next,
      origin: requestUrl.origin,
      hasUser: !!session?.user,
      metadata: session?.user?.user_metadata
    })

    // Redirect to the intended destination
    const redirectUrl = new URL(next, requestUrl.origin)
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    logger.error('Unexpected error in callback', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
  }
}
