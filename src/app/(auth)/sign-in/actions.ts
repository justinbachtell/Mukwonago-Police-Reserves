'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/server'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'sign-in/actions.ts'
})

export async function signIn(formData: FormData) {
  logger.info('Processing sign-in request', undefined, 'signIn')
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }

  logger.time('sign-in-attempt')
  const result = await supabase.auth.signInWithPassword(data)
  logger.timeEnd('sign-in-attempt')

  if (result.error) {
    logger.error('Sign-in failed', { error: result.error }, 'signIn')
    return { error: result.error }
  }

  logger.info('Sign-in successful', { userId: result.data.user?.id }, 'signIn')
  revalidatePath('/', 'layout')
  return { data: result.data }
}

export async function signup(formData: FormData) {
  logger.info('Processing sign-up request', undefined, 'signup')
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }

  logger.time('sign-up-attempt')
  const result = await supabase.auth.signUp(data)
  logger.timeEnd('sign-up-attempt')

  if (result.error) {
    logger.error('Sign-up failed', { error: result.error }, 'signup')
    return { error: result.error }
  }

  logger.info('Sign-up successful', { userId: result.data.user?.id }, 'signup')
  revalidatePath('/', 'layout')
  return { data: result.data }
}
