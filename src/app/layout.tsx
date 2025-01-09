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
    allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW', 'CATEGORY:MONITOR'],
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

    if (!user) {
      logger.error(
        'Failed to get auth user',
        logger.errorWithData(user),
        'RootLayout'
      )
      return null
    }

    // Log authentication status
    logger.info(
      'Auth user status',
      {
        isAuthenticated: !!user,
        userId: user.id
      },
      'RootLayout'
    )

    // Verify request with Arcjet
    if (Env.ARCJET_KEY) {
      logger.time('arcjet-verification')
      logger.info('Verifying request with Arcjet', undefined, 'RootLayout')

      const req = await request()
      const decision = await aj.protect(req)

      if (decision.isDenied()) {
        const error = decision.reason.isBot()
          ? 'Bot access denied'
          : 'Access denied by security rules'
        logger.warn(error, { decision }, 'RootLayout')
        throw new Error(error)
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
    throw error
  } finally {
    logger.timeEnd('root-layout-render')
  }
}