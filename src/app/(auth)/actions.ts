'use server'

import { createClient } from '@/lib/server'
import { withAuthErrorHandling } from '@/lib/auth-error'
import { createLogger } from '@/lib/debug'
import { revalidatePath } from 'next/cache'

const logger = createLogger({
  module: 'auth',
  file: 'actions.ts'
})

export async function signIn(formData: FormData) {
  logger.info('Processing sign-in request', undefined, 'signIn')
  const supabase = await createClient()

  logger.time('sign-in-attempt')
  const result = await withAuthErrorHandling(async () => {
    const signInResult = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string
    })
    if (signInResult.error) {
      throw signInResult.error
    }
    return signInResult.data
  }, 'signIn')
  logger.timeEnd('sign-in-attempt')

  if (result.error) {
    logger.error('Sign-in failed', { error: result.error }, 'signIn')
    return { error: result.error }
  }

  if (!result.data) {
    logger.error('Sign-in failed - no data returned', undefined, 'signIn')
    return { error: new Error('No data returned from sign-in') }
  }

  logger.info('Sign-in successful', { userId: result.data.user?.id }, 'signIn')
  revalidatePath('/', 'layout')
  return { data: result.data }
}
