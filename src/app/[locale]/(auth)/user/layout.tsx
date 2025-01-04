import { getCurrentUser } from '@/actions/user';
import { SignOutButtonWrapper } from '@/components/auth/SignOutButtonWrapper'
import { BaseTemplate } from '@/templates/BaseTemplate'
import { setRequestLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UserLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  setRequestLocale(locale)

  // Get user roles
  const user = await getCurrentUser()

  if (!user) {
    return redirect('/sign-in')
  }

  return (
    <BaseTemplate user={user} signOutButton={<SignOutButtonWrapper />}>
      {props.children}
    </BaseTemplate>
  )
}
