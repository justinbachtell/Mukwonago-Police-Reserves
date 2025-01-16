import type { Metadata } from 'next'
import '@/styles/global.css'
import { createLogger } from '@/lib/debug'
import { getCurrentUser } from '@/actions/user'
import { UserProvider } from '@/components/auth/UserProvider'
import { Analytics } from '@vercel/analytics/react'
import { NotificationProvider } from '@/context/NotificationContext'
import { ThemeProvider } from '@/components/theme/ThemeProvider'

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
      sizes: '96x96',
      type: 'image/png',
      url: '/favicon-96x96.png'
    },
    {
      rel: 'icon',
      sizes: '120x120',
      type: 'image/png',
      url: '/favicon-120x120.png'
    },
    {
      rel: 'icon',
      sizes: '192x192',
      type: 'image/png',
      url: '/web-app-manifest-192x192.png'
    },
    {
      rel: 'icon',
      sizes: '512x512',
      type: 'image/png',
      url: '/web-app-manifest-512x512.png'
    },
    {
      rel: 'icon',
      url: '/favicon.ico'
    },
    {
      rel: 'manifest',
      url: '/site.webmanifest'
    }
  ]
}

// Increase max listeners to prevent warning
if (process.env.NODE_ENV !== 'production') {
  process.setMaxListeners(20)
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  logger.info('Rendering root layout', undefined, 'RootLayout')
  logger.time('root-layout-render')

  try {
    const user = await getCurrentUser()

    return (
      <html lang='en' suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <UserProvider user={user}>
              <NotificationProvider>
                {children}
                <Analytics />
              </NotificationProvider>
            </UserProvider>
          </ThemeProvider>
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
      <html lang='en' suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <UserProvider user={null}>
              <NotificationProvider>
                {children}
                <Analytics />
              </NotificationProvider>
            </UserProvider>
          </ThemeProvider>
        </body>
      </html>
    )
  } finally {
    logger.timeEnd('root-layout-render')
  }
}
