import { getCurrentUser } from '@/actions/user'
import { SignOutButtonWrapper } from '@/components/auth/SignOutButtonWrapper'
import { BaseTemplate } from '@/templates/BaseTemplate'
import { setRequestLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  setRequestLocale(locale)

  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  if (user.role !== 'admin') {
    redirect('/user/dashboard')
  }

  return (
    <BaseTemplate user={user} signOutButton={<SignOutButtonWrapper />}>
      <div className='flex-1 transition-[padding] duration-300 ease-in-out'>
        {props.children}
      </div>
    </BaseTemplate>
  )
}
