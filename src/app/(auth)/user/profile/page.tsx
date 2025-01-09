import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { LoadingShell, LoadingForm } from '@/components/loading/LoadingShell'
import { ProfileForm } from '@/components/forms/profileForm'
import { getCurrentUser } from '@/actions/user'
import { getCurrentEmergencyContact } from '@/actions/emergencyContact'
import { getCurrentUniformSizes } from '@/actions/uniformSizes'
import { getAssignedEquipment } from '@/actions/assignedEquipment'
import type { AssignedEquipment } from '@/types/assignedEquipment'
import type { UniformSizes } from '@/types/uniformSizes'
import { toISOString } from '@/lib/utils'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'

const logger = createLogger({
  module: 'auth',
  file: 'user/profile/page.tsx'
})

async function ProfileHeader() {
  logger.info(
    'Fetching user data for profile header',
    undefined,
    'ProfileHeader'
  )
  logger.time('profile-header-load')

  try {
    const supabase = await createClient()

    // Verify session
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()
    if (sessionError) {
      logger.error(
        'Failed to get session',
        logger.errorWithData(sessionError),
        'ProfileHeader'
      )
      throw sessionError
    }

    if (!session?.user) {
      logger.info(
        'No active session, redirecting to sign-in',
        undefined,
        'ProfileHeader'
      )
      return redirect('/sign-in')
    }

    // Get user data
    const user = await getCurrentUser()
    if (!user) {
      logger.warn(
        'No user data found',
        { userId: session.user.id },
        'ProfileHeader'
      )
      return null
    }

    logger.info(
      'Profile header data loaded',
      { userId: user.id },
      'ProfileHeader'
    )
    logger.timeEnd('profile-header-load')

    return (
      <div className='flex items-center gap-6'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold'>
            {user.first_name} {user.last_name}&apos;s Profile
          </h1>
          <p className='text-muted-foreground'>{session.user.email}</p>
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error loading profile header',
      logger.errorWithData(error),
      'ProfileHeader'
    )
    logger.timeEnd('profile-header-load')
    throw error
  }
}

async function ProfileFormWrapper() {
  logger.info(
    'Initializing profile form wrapper',
    undefined,
    'ProfileFormWrapper'
  )
  logger.time('profile-form-load')

  try {
    const supabase = await createClient()

    // Verify session
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()
    if (sessionError) {
      logger.error(
        'Failed to get session',
        logger.errorWithData(sessionError),
        'ProfileFormWrapper'
      )
      throw sessionError
    }

    if (!session?.user) {
      logger.info(
        'No active session, redirecting to sign-in',
        undefined,
        'ProfileFormWrapper'
      )
      return redirect('/sign-in')
    }

    // Get user data
    const user = await getCurrentUser()
    if (!user) {
      logger.warn(
        'No user data found',
        { userId: session.user.id },
        'ProfileFormWrapper'
      )
      return null
    }

    // Fetch all related data
    logger.time('fetch-profile-data')
    const [sizesData, currentEmergencyContact, equipmentData] =
      await Promise.all([
        getCurrentUniformSizes(user.id),
        getCurrentEmergencyContact(),
        getAssignedEquipment(user.id)
      ])
    logger.timeEnd('fetch-profile-data')

    // Transform sizes data to match UniformSizes type
    const currentSizes = sizesData
      ? ({
          ...sizesData,
          created_at: toISOString(sizesData.created_at),
          updated_at: toISOString(sizesData.updated_at)
        } as UniformSizes)
      : null

    logger.info(
      'Profile data loaded',
      {
        userId: user.id,
        hasSizes: !!currentSizes,
        hasEmergencyContact: !!currentEmergencyContact,
        equipmentCount: equipmentData?.length ?? 0
      },
      'ProfileFormWrapper'
    )

    // Transform equipment data to match the expected type
    const currentEquipment = equipmentData?.[0]
      ? ({
          id: equipmentData[0].id,
          equipment_id: equipmentData[0].equipment_id,
          user_id: equipmentData[0].user_id,
          condition: equipmentData[0].condition,
          notes: equipmentData[0].notes,
          checked_out_at: equipmentData[0].checked_out_at,
          checked_in_at: equipmentData[0].checked_in_at,
          expected_return_date: equipmentData[0].expected_return_date,
          created_at: equipmentData[0].created_at,
          updated_at: equipmentData[0].updated_at
        } as AssignedEquipment)
      : null

    logger.timeEnd('profile-form-load')
    return (
      <ProfileForm
        user={user}
        currentSizes={currentSizes}
        currentEmergencyContact={currentEmergencyContact}
        currentEquipment={currentEquipment}
      />
    )
  } catch (error) {
    logger.error(
      'Error loading profile form',
      logger.errorWithData(error),
      'ProfileFormWrapper'
    )
    logger.timeEnd('profile-form-load')
    throw error
  }
}

export default function ProfilePage() {
  logger.info('Rendering profile page', undefined, 'ProfilePage')

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <Suspense
        fallback={
          <LoadingShell className='flex items-center gap-6'>
            <Skeleton className='size-24 rounded-full' />
          </LoadingShell>
        }
      >
        <ProfileHeader />
      </Suspense>

      <Suspense fallback={<LoadingForm />}>
        <ProfileFormWrapper />
      </Suspense>
    </div>
  )
}
