import { getAllEquipment } from '@/actions/equipment'
import { getCurrentUser, getAllUsers } from '@/actions/user'
import { redirect } from 'next/navigation'
import { DataTable } from '@/components/ui/data-table'
import { columns, type EquipmentWithUser } from './columns'
import { createLogger } from '@/lib/debug'
import { toISOString } from '@/lib/utils'

const logger = createLogger({
  module: 'admin',
  file: 'equipment/page.tsx'
})

export default async function AdminEquipmentPage() {
  logger.info('Rendering equipment page', undefined, 'AdminEquipmentPage')
  logger.time('equipment-page-load')

  try {
    const [user, rawEquipment, users] = await Promise.all([
      getCurrentUser(),
      getAllEquipment(),
      getAllUsers()
    ])

    if (!user) {
      logger.warn(
        'No user found, redirecting to sign-in',
        undefined,
        'AdminEquipmentPage'
      )
      redirect('/sign-in')
    }

    if (user.role !== 'admin') {
      logger.warn(
        'Non-admin user access attempt',
        { userId: user.id },
        'AdminEquipmentPage'
      )
      redirect('/user/dashboard')
    }

    logger.info('Processing equipment data', undefined, 'AdminEquipmentPage')
    const equipment: EquipmentWithUser[] = (rawEquipment ?? []).map(item => {
      const assignedUser = users.find(u => u.id === item.assigned_to)
      return {
        ...item,
        created_at: toISOString(new Date(item.created_at)),
        updated_at: toISOString(new Date(item.updated_at)),
        purchase_date: item.purchase_date
          ? toISOString(new Date(item.purchase_date))
          : null,
        assignedUserName: assignedUser
          ? `${assignedUser.first_name} ${assignedUser.last_name}`
          : null,
        condition: (item as any).assignments?.[0]?.condition || 'good'
      }
    })

    logger.info(
      'Equipment data loaded',
      { count: equipment?.length },
      'AdminEquipmentPage'
    )

    return (
      <div className='container mx-auto py-6'>
        <div className='mb-4'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Equipment Management
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Manage equipment inventory and assignments.
          </p>
        </div>

        <div className='w-full space-y-4 overflow-x-auto'>
          <DataTable columns={columns} data={equipment} />
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in equipment page',
      logger.errorWithData(error),
      'AdminEquipmentPage'
    )
    throw error
  } finally {
    logger.timeEnd('equipment-page-load')
  }
}
