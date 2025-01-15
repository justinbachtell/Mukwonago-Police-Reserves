import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'auth/callback/route.ts'
})

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/user/dashboard'
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')

    // Handle OAuth error parameters
    if (error || error_description) {
      logger.error(
        'OAuth error in callback',
        { error, error_description },
        'GET'
      )
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    if (!code) {
      logger.error(
        'No code provided in callback',
        { searchParams: Object.fromEntries(searchParams) },
        'GET'
      )
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    const supabase = await createClient()
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      logger.error(
        'Failed to exchange code for session',
        {
          error: exchangeError,
          message: exchangeError.message,
          status: exchangeError.status
        },
        'GET'
      )
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    logger.info('Successfully exchanged code for session', { next }, 'GET')
    return NextResponse.redirect(`${origin}${next}`)
  } catch (error) {
    logger.error(
      'Unexpected error in callback',
      {
        error,
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      'GET'
    )
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }
}
