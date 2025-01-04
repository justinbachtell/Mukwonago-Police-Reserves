import { getCurrentUser } from '@/actions/user'
import { SignOutButtonWrapper } from '@/components/auth/SignOutButtonWrapper'
import { BaseTemplate } from '@/templates/BaseTemplate'
import { setRequestLocale } from 'next-intl/server'

export default async function RecruitingLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  setRequestLocale(locale)

  const user = await getCurrentUser()

  return (
    <BaseTemplate user={user} signOutButton={<SignOutButtonWrapper />}>
      <div className='[&_p]:my-6'>{props.children}</div>
    </BaseTemplate>
  )
}
