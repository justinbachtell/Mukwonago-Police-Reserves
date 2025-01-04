import { getCurrentUser } from '@/actions/user'
import { SignOutButtonWrapper } from '@/components/auth/SignOutButtonWrapper'
import { BaseTemplate } from '@/templates/BaseTemplate'
import { setRequestLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ReservesLayout(props: {
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

  if (
    user.role !== 'member' &&
    user.role !== 'admin' &&
    user.position === 'candidate'
  ) {
    return redirect('/user/dashboard')
  }

  return (
    <BaseTemplate user={user} signOutButton={<SignOutButtonWrapper />}>
      <div className='[&_p]:my-6'>{props.children}</div>
    </BaseTemplate>
  )
}
