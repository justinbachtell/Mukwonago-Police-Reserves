// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import * as Spotlight from '@spotlightjs/spotlight';

Sentry.init({
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // Sentry DSN
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Add toast-specific error handling
  beforeSend(event, hint) {
    // Don't capture form submission events in Spotlight
    if (
      process.env.NODE_ENV === 'development' &&
      hint?.originalException instanceof Error &&
      hint.originalException.message.includes('FormData')
    ) {
      return null
    }

    // Handle toast-related errors
    if (event.extra?.component === 'toast') {
      event.tags = {
        ...event.tags,
        toast_action: String(event.extra.action || '')
      }
    }

    // Sanitize form data to prevent parsing issues
    if (event.extra?.formData) {
      try {
        event.extra.formData = '[Form Data Redacted]'
      } catch (e) {
        delete event.extra.formData
        console.error('Error sanitizing form data:', e)
      }
    }

    return event
  },

  // Add optional integrations for additional features
  integrations: [
    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    Sentry.replayIntegration({
      blockAllMedia: true,
      // Additional Replay configuration goes in here, for example:
      maskAllText: true
    })
  ],

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
})

if (process.env.NODE_ENV === 'development') {
  Spotlight.init();
}
