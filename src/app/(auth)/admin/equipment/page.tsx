'use client'

import { getAllEquipment } from '@/actions/equipment'
import { getCurrentUser, getAllUsers } from '@/actions/user'
import { redirect } from 'next/navigation'
import { DataTable } from '@/components/ui/data-table'
import { columns, type EquipmentWithUser } from './columns'
import { createLogger } from '@/lib/debug'
import { toISOString } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { EquipmentForm } from '@/components/admin/forms/equipmentForm'
import { useState, useEffect } from 'react'

const logger = createLogger({
  module: 'admin',
  file: 'equipment/page.tsx'
})

export default function AdminEquipmentPage() {
  const [open, setOpen] = useState(false)
  const [equipment, setEquipment] = useState<EquipmentWithUser[]>([])
  const [_isLoading, setIsLoading] = useState(true)

  const fetchEquipment = async () => {
    try {
      logger.info('Fetching equipment data')
      const [user, rawEquipment, users] = await Promise.all([
        getCurrentUser(),
        getAllEquipment(),
        getAllUsers()
      ])

      if (!user) {
        logger.warn('No user found, redirecting to sign-in')
        redirect('/sign-in')
      }

      if (user.role !== 'admin') {
        logger.warn('Non-admin user access attempt', { userId: user.id })
        redirect('/user/dashboard')
      }

      logger.info('Processing equipment data')
      const processedEquipment: EquipmentWithUser[] = (rawEquipment ?? []).map(
        item => {
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
        }
      )

      setEquipment(processedEquipment)
      logger.info('Equipment data loaded', {
        count: processedEquipment?.length
      })
    } catch (error) {
      logger.error('Error fetching equipment data', logger.errorWithData(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipment()
  }, [])

  const handleSuccess = () => {
    setOpen(false)
    fetchEquipment()
  }

  return (
    <div className='container relative mx-auto overflow-hidden bg-white dark:bg-gray-950'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Equipment Management
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Manage equipment inventory and assignments.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Plus className='size-4' />
              Create Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Create Equipment</DialogTitle>
              <DialogDescription>
                Add new equipment to the inventory
              </DialogDescription>
            </DialogHeader>
            <div className='mt-4'>
              <EquipmentForm
                closeDialog={() => setOpen(false)}
                onSuccess={handleSuccess}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className='w-full space-y-4 overflow-x-auto'>
        <DataTable columns={columns} data={equipment} />
      </div>
    </div>
  )
}
