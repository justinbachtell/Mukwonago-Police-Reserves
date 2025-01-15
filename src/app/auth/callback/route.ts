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
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/user/dashboard'

    if (code) {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        logger.info('Successfully exchanged code for session', { next }, 'GET')
        return NextResponse.redirect(`${origin}${next}`)
      }
      logger.error('Failed to exchange code for session', { error }, 'GET')
    }

    // return the user to an error page with instructions
    logger.error('No code provided in callback', undefined, 'GET')
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  } catch (error) {
    logger.error('Unexpected error in callback', { error }, 'GET')
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }
}
