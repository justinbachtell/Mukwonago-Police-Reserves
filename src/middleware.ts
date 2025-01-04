import type { NextFetchEvent, NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './libs/i18nNavigation';

const intlMiddleware = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  '/admin/(.*)',
  '/:locale/admin/(.*)',
  '/user/(dashboard|settings|profile|applications)(.*)',
  '/:locale/user/(dashboard|settings|profile|applications)(.*)',
  '/user/dashboard(.*)',
  '/:locale/user/dashboard(.*)',
  '/application(.*)',
  '/:locale/application(.*)',
  '/contacts(.*)',
  '/:locale/contacts(.*)',
  '/events(.*)',
  '/:locale/events(.*)',
  '/training(.*)',
  '/:locale/training(.*)',
  '/policies(.*)',
  '/:locale/policies(.*)'
])

const isAuthPage = createRouteMatcher([
  '/',
  '/:locale/',
  '/sign-in(.*)',
  '/:locale/sign-in(.*)',
  '/sign-up(.*)',
  '/:locale/sign-up(.*)',
  '/about(.*)',
  '/:locale/about(.*)'
])

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  // Run Clerk middleware only when it's necessary
  if (isAuthPage(request) || isProtectedRoute(request)) {
    return clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        const locale = req.nextUrl.pathname.match(/(\/.*)\/user\/dashboard/)?.at(1) ?? '';

        const signInUrl = new URL(`${locale}/sign-in`, req.url);

        await auth.protect({
          // `unauthenticatedUrl` is needed to avoid error: "Unable to find `next-intl` locale because the middleware didn't run on this request"
          unauthenticatedUrl: signInUrl.toString(),
        });
      }

      return intlMiddleware(req);
    })(request, event);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
