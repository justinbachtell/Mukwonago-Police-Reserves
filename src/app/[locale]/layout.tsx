import type { Metadata } from 'next';
import arcjet, { detectBot, request } from '@/libs/Arcjet';
import { Env } from '@/libs/Env';
import { routing } from '@/libs/i18nNavigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ClerkProvider } from '@clerk/nextjs'
import { enUS, esES } from '@clerk/localizations'
import '@/styles/global.css'

export const metadata: Metadata = {
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

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    // Block all bots except the following
    allow: [
      // See https://docs.arcjet.com/bot-protection/identifying-bots
      'CATEGORY:SEARCH_ENGINE', // Allow search engines
      'CATEGORY:PREVIEW', // Allow preview links to show OG images
      'CATEGORY:MONITOR' // Allow uptime monitoring services
    ],
    mode: 'LIVE'
  })
)

export default async function RootLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params

  if (!routing.locales.includes(locale)) {
    notFound()
  }

  setRequestLocale(locale)

  // Configure Clerk localization
  let clerkLocale = enUS
  let signInUrl = '/sign-in'
  let signUpUrl = '/sign-up'
  let dashboardUrl = '/user/dashboard'
  let afterSignOutUrl = '/'

  if (locale === 'es') {
    clerkLocale = esES
  }

  if (locale !== routing.defaultLocale) {
    signInUrl = `/${locale}${signInUrl}`
    signUpUrl = `/${locale}${signUpUrl}`
    dashboardUrl = `/${locale}${dashboardUrl}`
    afterSignOutUrl = `/${locale}${afterSignOutUrl}`
  }

  // Verify the request with Arcjet
  if (Env.ARCJET_KEY) {
    const req = await request()
    const decision = await aj.protect(req)

    // These errors are handled by the global error boundary, but you could also
    // redirect or show a custom error page
    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        throw new Error('No bots allowed')
      }

      throw new Error('Access denied')
    }
  }

  // Using internationalization in Client Components
  const messages = await getMessages()

  // The `suppressHydrationWarning` attribute in <body> is used to prevent hydration errors caused by Sentry Overlay,
  // which dynamically adds a `style` attribute to the body tag.

  return (
    <html lang={locale}>
      <body suppressHydrationWarning className='overflow-x-hidden'>
        <ClerkProvider
          localization={clerkLocale}
          signInUrl={signInUrl}
          signUpUrl={signUpUrl}
          signInFallbackRedirectUrl={dashboardUrl}
          signUpFallbackRedirectUrl={dashboardUrl}
          afterSignOutUrl={afterSignOutUrl}
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            {props.children}
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
