import type { Metadata } from 'next'
import arcjet, { detectBot, request } from '@/libs/Arcjet'
import { Env } from '@/libs/Env'
import '@/styles/global.css'
import { createLogger } from '@/lib/debug'
import { getCurrentUser } from '@/actions/user'
import { UserProvider } from '@/components/auth/UserProvider'

const logger = createLogger({
  module: 'root',
  file: 'layout.tsx'
})

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Mukwonago Police Reserves',
  description: 'Official website of the Mukwonago Police Reserves',
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png'
    },
    {
      rel: 'icon',
      sizes: '32x32',
      type: 'image/png',
      url: '/favicon-32x32.png'
    },
    {
      rel: 'icon',
      sizes: '16x16',
      type: 'image/png',
      url: '/favicon-16x16.png'
    },
    {
      rel: 'icon',
      url: '/favicon.ico'
    }
  ]
}

const aj = arcjet.withRule(
  detectBot({
    allow: [
      'CATEGORY:SEARCH_ENGINE',
      'CATEGORY:PREVIEW',
      'CATEGORY:MONITOR',
      'CATEGORY:TOOL'
    ],
    mode: process.env.NODE_ENV === 'production' ? 'LIVE' : 'DRY_RUN'
  })
)

// Increase max listeners to prevent warning
if (process.env.NODE_ENV !== 'production') {
  process.setMaxListeners(20)
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  logger.info('Initializing root layout', undefined, 'RootLayout')
  logger.time('root-layout-render')

  try {
    logger.time('auth-session-check')
    const user = await getCurrentUser()
    logger.timeEnd('auth-session-check')

    // Log authentication status even if no user
    logger.info(
      'Auth user status',
      {
        isAuthenticated: !!user,
        userId: user?.id
      },
      'RootLayout'
    )

    // Verify request with Arcjet
    if (Env.ARCJET_KEY) {
      logger.time('arcjet-verification')
      logger.info('Verifying request with Arcjet', undefined, 'RootLayout')

      try {
        const decision = await aj.protect(await request())

        if (decision.conclusion === 'DENY') {
          if (process.env.NODE_ENV === 'development') {
            logger.warn('Arcjet would deny access in production', {
              decision,
              reason: decision.reason
            })
            // Continue in development
          } else {
            throw new Error('Access denied by security rules')
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Arcjet error (continuing in development)', {
            error,
            context: 'RootLayout'
          })
          // Continue in development
        } else {
          throw error
        }
      }

      logger.info('Request verified successfully', undefined, 'RootLayout')
      logger.timeEnd('arcjet-verification')
    } else {
      logger.warn('ARCJET_KEY not configured', undefined, 'RootLayout')
    }

    return (
      <html lang='en'>
        <body suppressHydrationWarning className='overflow-x-hidden'>
          <UserProvider user={user}>{children}</UserProvider>
        </body>
      </html>
    )
  } catch (error) {
    logger.error(
      'Error in root layout',
      logger.errorWithData(error),
      'RootLayout'
    )

    // Return basic layout even on error
    return (
      <html lang='en'>
        <body suppressHydrationWarning className='overflow-x-hidden'>
          {children}
        </body>
      </html>
    )
  } finally {
    logger.timeEnd('root-layout-render')
  }
}