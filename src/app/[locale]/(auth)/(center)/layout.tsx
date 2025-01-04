import { getCurrentUser } from '@/actions/user'
import { BaseTemplate } from '@/templates/BaseTemplate'
import { setRequestLocale } from 'next-intl/server'

export default async function CenteredLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  setRequestLocale(locale)

  const user = await getCurrentUser()

  return (
    <BaseTemplate user={user}>
      <div className='container mx-auto flex justify-center px-4 py-8'>
        {props.children}
      </div>
    </BaseTemplate>
  )
}
