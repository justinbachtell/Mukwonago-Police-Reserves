import * as Sentry from '@sentry/nextjs';

export const onRequestError = Sentry.captureRequestError;

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Node.js Sentry configuration
    Sentry.init({
      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,

      // Sentry DSN
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

      // Enable Spotlight in development
      spotlight: process.env.NODE_ENV === 'development',

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge Sentry configuration
    Sentry.init({
      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,

      // Sentry DSN
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

      // Enable Spotlight in development
      spotlight: process.env.NODE_ENV === 'development',

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1,
    });
  }
}
