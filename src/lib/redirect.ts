export const getRedirectUrl = (next?: string) => {
  const redirectTo = `${window.location.origin}/auth/callback`
  if (next) {
    return `${redirectTo}?next=${next}`
  }
  return redirectTo
}
