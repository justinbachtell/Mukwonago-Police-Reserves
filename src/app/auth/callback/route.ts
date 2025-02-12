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
    const state = requestUrl.searchParams.get('state')
    const type = requestUrl.searchParams.get('type')
    let next = '/user/dashboard'

    // Try to parse the state parameter to get the returnTo URL
    if (state) {
      try {
        // Decode base64 state
        const decodedState = atob(state)
        const stateData = JSON.parse(decodedState)
        if (stateData.returnTo) {
          next = stateData.returnTo
        }
      } catch (e) {
        logger.error('Failed to parse state parameter', {
          state,
          error: e
        })
      }
    }

    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')

    logger.info('Auth callback received', {
      hasCode: !!code,
      next,
      hasError: !!error,
      error_description,
      hasState: !!state,
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

    if (type === 'signup') {
      // Handle email signup confirmation
      const token_hash = requestUrl.searchParams.get('token_hash')
      if (token_hash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type: 'signup',
          token_hash
        })

        if (verifyError) {
          logger.error('Failed to verify signup', {
            error: verifyError,
            token_hash
          })
          return NextResponse.redirect(
            new URL('/auth/auth-code-error', requestUrl.origin)
          )
        }

        // After successful verification, get the user
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser()

        if (user && !userError) {
          // Get the metadata that was set during signup
          const metadata = user.user_metadata
          const firstName = metadata?.first_name || ''
          const lastName = metadata?.last_name || ''

          try {
            // Update the database directly
            const { error: dbError } = await supabase
              .from('user')
              .update({
                first_name: firstName,
                last_name: lastName,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id)

            if (dbError) {
              logger.error('Failed to update user in database after signup', {
                error: dbError,
                userId: user.id,
                firstName,
                lastName
              })
            } else {
              logger.info(
                'Successfully updated user in database after signup',
                {
                  userId: user.id,
                  firstName,
                  lastName
                }
              )
            }
          } catch (dbError) {
            logger.error('Error updating user in database after signup', {
              error: dbError,
              userId: user.id,
              firstName,
              lastName
            })
          }
        }
      }
    } else if (code) {
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
        let firstName = metadata?.given_name || metadata?.first_name || ''
        let lastName = metadata?.family_name || metadata?.last_name || ''

        // If we have a full_name but no first/last name, try to parse it
        if (!firstName && !lastName && metadata?.full_name) {
          const nameParts = metadata.full_name.split(' ')
          if (nameParts.length >= 2) {
            firstName = nameParts[0]
            lastName = nameParts.slice(1).join(' ')
          } else if (nameParts.length === 1) {
            firstName = nameParts[0]
          }
        }

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
    }

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
