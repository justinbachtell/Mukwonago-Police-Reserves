import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { LoadingShell, LoadingForm } from '@/components/loading/LoadingShell'
import { ProfileForm } from '@/components/forms/profileForm'
import { getCurrentUser } from '@/actions/user'
import { getCurrentEmergencyContact } from '@/actions/emergencyContact'
import { getCurrentUniformSizes } from '@/actions/uniformSizes'
import { getCurrentAssignedEquipment } from '@/actions/assignedEquipment'

async function ProfileHeader() {
  const user = await getCurrentUser()
  if (!user) {
    return null
  }

  return (
    <div className='flex items-center gap-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold'>
          {user.first_name} {user.last_name}&apos;s Profile
        </h1>
        <p className='text-muted-foreground'>{user.email}</p>
      </div>
    </div>
  )
}

async function ProfileFormWrapper() {
  const user = await getCurrentUser()
  if (!user) {
    return null
  }

  const [currentSizes, currentEmergencyContact, currentEquipmentData] =
    await Promise.all([
      getCurrentUniformSizes(user.id),
      getCurrentEmergencyContact(user.id),
      getCurrentAssignedEquipment(user.id)
    ])

  const currentEquipment = currentEquipmentData
    ? {
        ...currentEquipmentData,
        checked_out_at: new Date(currentEquipmentData.checked_out_at),
        checked_in_at: currentEquipmentData.checked_in_at
          ? new Date(currentEquipmentData.checked_in_at)
          : null,
        expected_return_date: currentEquipmentData.expected_return_date
          ? new Date(currentEquipmentData.expected_return_date)
          : null,
        created_at: new Date(currentEquipmentData.created_at),
        updated_at: new Date(currentEquipmentData.updated_at),
        equipment: currentEquipmentData.equipment
          ? {
              ...currentEquipmentData.equipment,
              purchase_date: currentEquipmentData.equipment.purchase_date
                ? new Date(currentEquipmentData.equipment.purchase_date)
                : null,
              created_at: new Date(currentEquipmentData.equipment.created_at),
              updated_at: new Date(currentEquipmentData.equipment.updated_at)
            }
          : null
      }
    : null

  return (
    <ProfileForm
      user={user}
      currentSizes={currentSizes}
      currentEmergencyContact={currentEmergencyContact}
      currentEquipment={currentEquipment}
    />
  )
}

export default function ProfilePage() {
  return (
    <div className='container mx-auto space-y-8 py-8'>
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
