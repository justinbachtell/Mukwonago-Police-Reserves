import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/') &&
    !request.nextUrl.pathname.startsWith('/sign-in') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/sign-up') &&
    !request.nextUrl.pathname.startsWith('/forgot-password') &&
    !request.nextUrl.pathname.startsWith('/reset-password') &&
    !request.nextUrl.pathname.startsWith('/magic-link') &&
    !request.nextUrl.pathname.startsWith('/verify-mfa') &&
    !request.nextUrl.pathname.startsWith('/monitoring') &&
    !request.nextUrl.pathname.startsWith('/auth/callback') &&
    !request.nextUrl.pathname.startsWith('/auth/v1/authorize') &&
    !request.nextUrl.pathname.startsWith('/auth/v1/signup') &&
    !request.nextUrl.pathname.startsWith('/auth/v1/token') &&
    !request.nextUrl.pathname.startsWith('/site.webmanifest') &&
    !request.nextUrl.pathname.startsWith('/favicon.ico') &&
    !request.nextUrl.pathname.startsWith('/apple-touch-icon.png') &&
    !request.nextUrl.pathname.startsWith('/favicon-16x16.png') &&
    !request.nextUrl.pathname.startsWith('/favicon-32x32.png') &&
    !request.nextUrl.pathname.startsWith('/favicon-96x96.png') &&
    !request.nextUrl.pathname.startsWith('/favicon-128x128.png') &&
    !request.nextUrl.pathname.startsWith('/web-app-manifest-192x192.png') &&
    !request.nextUrl.pathname.startsWith('/web-app-manifest-512x512.png')
  ) {
    // no user, potentially respond by redirecting the user to the signin page
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
