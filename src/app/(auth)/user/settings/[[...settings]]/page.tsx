import { UserSettingsForm } from '@/components/forms/userSettingsForm'
import { Loader2 } from 'lucide-react'
import { getCurrentUser } from '@/actions/user'
import { createLogger } from '@/lib/debug'
import { Toaster } from '@/components/ui/toaster'

const logger = createLogger({
  module: 'settings',
  file: 'page.tsx'
})

export const metadata = {
  title: 'Account Settings'
}

export default async function SettingsPage() {
  logger.info('Rendering settings page', undefined, 'SettingsPage')
  logger.time('settings-page-load')

  try {
    const user = await getCurrentUser()
    return (
      <div className='container relative mx-auto min-h-screen overflow-hidden px-4 md:px-6 lg:px-10'>
        <h1 className='mb-8 text-2xl font-bold'>Account Settings</h1>
        {user ? (
          <UserSettingsForm user={user} />
        ) : (
          <Loader2 className='size-4 animate-spin' />
        )}
        <Toaster />
      </div>
    )
  } catch (error) {
    logger.error(
      'Error loading settings page',
      logger.errorWithData(error),
      'SettingsPage'
    )
    throw error
  } finally {
    logger.timeEnd('settings-page-load')
  }
}
