import { getAssignedEquipment } from '@/actions/assignedEquipment'
import { getAvailableEquipment } from '@/actions/equipment'
import { getCurrentUser, getUserById } from '@/actions/user'
import { AssignEquipmentForm } from '@/components/admin/forms/assignEquipmentForm'
import { UserEquipmentTable } from '@/components/admin/users/UserEquipmentTable'
import { Card } from '@/components/ui/card'
import type { Equipment } from '@/types/equipment'
import { redirect } from 'next/navigation'
import { toISOString } from '@/lib/utils'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'users/[id]/equipment/page.tsx'
})

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function UserEquipmentPage({ params }: Props) {
  logger.info(
    'Initializing user equipment page',
    undefined,
    'UserEquipmentPage'
  )
  logger.time('user-equipment-page-load')

  try {
    const { id } = await params

    const [
      currentUser,
      targetUser,
      availableEquipmentData,
      assignedEquipmentData
    ] = await Promise.all([
      getCurrentUser(),
      getUserById(id),
      getAvailableEquipment(),
      getAssignedEquipment(id)
    ])

    if (!currentUser) {
      logger.warn('No authenticated user found', undefined, 'UserEquipmentPage')
      return redirect('/sign-in')
    }

    if (currentUser.role !== 'admin') {
      logger.warn(
        'Non-admin user attempted to access page',
        { userId: currentUser.id },
        'UserEquipmentPage'
      )
      return redirect('/user/dashboard')
    }

    if (!targetUser) {
      logger.error('Target user not found', { id }, 'UserEquipmentPage')
      return redirect('/admin/users')
    }

    const availableEquipment = (availableEquipmentData ?? []).map(
      (item: Equipment) => ({
        ...item,
        created_at: toISOString(new Date(item.created_at)),
        purchase_date: item.purchase_date
          ? toISOString(new Date(item.purchase_date))
          : null,
        updated_at: toISOString(new Date(item.updated_at))
      })
    )

    const assignedEquipment = (assignedEquipmentData ?? [])
      .map(item => {
        const processed = {
          ...item,
          created_at: toISOString(new Date(item.created_at)),
          updated_at: toISOString(new Date(item.updated_at)),
          checked_out_at: toISOString(new Date(item.checked_out_at)),
          checked_in_at: item.checked_in_at
            ? toISOString(new Date(item.checked_in_at))
            : null,
          expected_return_date: item.expected_return_date
            ? toISOString(new Date(item.expected_return_date))
            : null,
          equipment: item.equipment
            ? {
                ...item.equipment,
                created_at: toISOString(new Date(item.equipment.created_at)),
                updated_at: toISOString(new Date(item.equipment.updated_at)),
                purchase_date: item.equipment.purchase_date
                  ? toISOString(new Date(item.equipment.purchase_date))
                  : null
              }
            : null
        }
        return processed
      })
      .sort((a, b) => {
        if (!a.checked_in_at && b.checked_in_at) {
          return -1
        }
        if (a.checked_in_at && !b.checked_in_at) {
          return 1
        }

        const checkoutDateDiff =
          new Date(b.checked_out_at).getTime() -
          new Date(a.checked_out_at).getTime()
        if (checkoutDateDiff !== 0) {
          return checkoutDateDiff
        }

        if (a.checked_in_at && b.checked_in_at) {
          return (
            new Date(b.checked_in_at).getTime() -
            new Date(a.checked_in_at).getTime()
          )
        }
        return 0
      })

    return (
      <div className='container mx-auto pt-8'>
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Assign Equipment to {targetUser.first_name} {targetUser.last_name}
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Manage equipment assignments for this user.
          </p>
        </div>

        <div className='grid grid-cols-12 gap-8'>
          <Card className='col-span-12 p-6 xl:col-span-4 2xl:col-span-3'>
            <h2 className='mb-6 text-xl font-semibold text-gray-900 dark:text-white'>
              Assign New Equipment
            </h2>
            <AssignEquipmentForm
              users={[targetUser]}
              availableEquipment={availableEquipment}
            />
          </Card>

          <Card className='col-span-12 p-6 xl:col-span-8 2xl:col-span-9'>
            <h2 className='mb-6 text-xl font-semibold text-gray-900 dark:text-white'>
              Assigned Equipment
            </h2>
            <UserEquipmentTable data={assignedEquipment} />
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in user equipment page',
      logger.errorWithData(error),
      'UserEquipmentPage'
    )
    throw error
  } finally {
    logger.timeEnd('user-equipment-page-load')
  }
}
