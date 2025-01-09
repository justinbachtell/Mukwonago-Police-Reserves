import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Don't add NODE_ENV into T3 Env, it changes the tree-shaking behavior
export const Env = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1)
  },
  runtimeEnv: {
    // Better Auth
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_DATABASE_URL: process.env.BETTER_AUTH_DATABASE_URL,
    BETTER_AUTH_REDIRECT_URL: process.env.BETTER_AUTH_REDIRECT_URL,
    BETTER_AUTH_COOKIE_NAME: process.env.BETTER_AUTH_COOKIE_NAME,
    BETTER_AUTH_COOKIE_DOMAIN: process.env.BETTER_AUTH_COOKIE_DOMAIN,

    // Environment
    ENVIRONMENT_URL: process.env.ENVIRONMENT_URL,
    NODE_ENV: process.env.NODE_ENV,

    // Public variables
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // Misc
    EMAIL_ADDRESS: process.env.EMAIL_ADDRESS,
    VERCEL_BYPASS_TOKEN: process.env.VERCEL_BYPASS_TOKEN,
    ARCJET_KEY: process.env.ARCJET_KEY,
    LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN
  },
  server: {
    // Better Auth
    BETTER_AUTH_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_DATABASE_URL: z.string().min(1),
    BETTER_AUTH_REDIRECT_URL: z.string().min(1),
    BETTER_AUTH_COOKIE_NAME: z.string().min(1),
    BETTER_AUTH_COOKIE_DOMAIN: z.string().min(1),

    // Environment
    ENVIRONMENT_URL: z.string().url(),

    // Database
    DATABASE_URL: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

    // Misc
    EMAIL_ADDRESS: z.string().email(),
    VERCEL_BYPASS_TOKEN: z.string().optional(),
    ARCJET_KEY: z.string().startsWith('ajkey_').min(1),
    LOGTAIL_SOURCE_TOKEN: z.string().optional()
  },
  shared: {
    NODE_ENV: z.enum(['development', 'production', 'test'])
  }
})
