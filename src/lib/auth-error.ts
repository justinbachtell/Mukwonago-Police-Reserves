import { createLogger } from '@/lib/debug'
import type { AuthError } from '@supabase/supabase-js'

const logger = createLogger({
  module: 'auth',
  file: 'auth-error.ts'
})

type AuthErrorMapping = {
  [key: string]: {
    message: string
    action?: string
  }
}

// Mapping of Supabase error codes to user-friendly messages and actions
const AUTH_ERROR_MAPPING: AuthErrorMapping = {
  'auth/invalid_credentials': {
    message: 'Invalid email or password',
    action: 'Please check your credentials and try again'
  },
  email_not_confirmed: {
    message: 'Email not verified',
    action: 'Please check your email for a verification link'
  },
  user_not_found: {
    message: 'User not found',
    action: 'Please sign up for an account'
  },
  email_exists: {
    message: 'Email already registered',
    action: 'Please use a different email or try logging in'
  }
  // Add more error mappings as needed
}

export function handleAuthError(error: AuthError | null, context: string) {
  if (!error) {
    return null
  }

  logger.error(
    'Auth error occurred',
    {
      code: error.code,
      message: error.message,
      name: error.name,
      status: error.status,
      context
    },
    'handleAuthError'
  )

  const errorMapping = error.code
    ? AUTH_ERROR_MAPPING[error.code]
    : {
        message: 'An unexpected error occurred',
        action: 'Please try again later'
      }

  // Log additional debug information in development
  logger.debug(
    'Auth error details',
    {
      status: error.status,
      name: error.name,
      stack: error.stack
    },
    'handleAuthError'
  )

  return {
    code: error.code,
    message: errorMapping?.message,
    action: errorMapping?.action,
    status: error.status
  }
}

// Helper function for common auth operations
export function withAuthErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<{ data: T | null; error: ReturnType<typeof handleAuthError> }> {
  return operation()
    .then(data => ({ data, error: null }))
    .catch(error => {
      const handledError = handleAuthError(error, context)
      logger.error(
        'Auth operation failed',
        { context, error: handledError },
        'withAuthErrorHandling'
      )
      return { data: null, error: handledError }
    })
}
