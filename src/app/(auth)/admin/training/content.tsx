'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger
} from '@/components/ui/dialog'
import { TrainingForm } from '@/components/admin/training/TrainingForm'
import { TrainingManagementTable } from '@/components/admin/training/TrainingManagementTable'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createLogger } from '@/lib/debug'
import type { Training } from '@/types/training'
import type { DBUser } from '@/types/user'
import { getAllUsers } from '@/actions/user'

const logger = createLogger({
  module: 'admin',
  file: 'training/content.tsx'
})

interface AdminTrainingContentProps {
  initialTrainings: Training[]
}

export function AdminTrainingContent({
  initialTrainings
}: AdminTrainingContentProps) {
  const [open, setOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<DBUser[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers()
        if (users) {
          setAvailableUsers(users)
        }
      } catch (error) {
        logger.error(
          'Error fetching users',
          logger.errorWithData(error),
          'AdminTrainingContent'
        )
      }
    }

    fetchUsers()
  }, [])

  logger.info(
    'Rendering training content',
    { trainingCount: initialTrainings.length },
    'AdminTrainingContent'
  )

  return (
    <div className='container mx-auto py-10'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Training Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Training</Button>
          </DialogTrigger>
          <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Create Training</DialogTitle>
            </DialogHeader>
            <TrainingForm
              availableUsers={availableUsers}
              onSuccess={() => {
                setOpen(false)
                router.refresh()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className='mt-8'>
        <TrainingManagementTable
          data={initialTrainings}
          availableUsers={availableUsers}
        />
      </div>
    </div>
  )
}
