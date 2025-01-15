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
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

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

    logger.info('Successfully exchanged code for session', {
      next,
      origin: requestUrl.origin
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
