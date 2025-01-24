'use client'

import type { Training } from '@/types/training'
import type { DBUser } from '@/types/user'
import type { SortingState } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { createColumns } from '@/app/(auth)/admin/training/columns'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { createLogger } from '@/lib/debug'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { TrainingForm } from '@/components/admin/training/TrainingForm'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const logger = createLogger({
  module: 'admin',
  file: 'TrainingTableWrapper.tsx'
})

interface TrainingTableWrapperProps {
  initialData: Training[]
  availableUsers: DBUser[]
}

export function TrainingTableWrapper({
  initialData,
  availableUsers
}: TrainingTableWrapperProps) {
  const [open, setOpen] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'training_date', desc: true }
  ])
  const [trainings, setTrainings] = useState<Training[]>(initialData)
  const router = useRouter()
  const columns = useMemo(() => createColumns(availableUsers), [availableUsers])

  // Transform the data to include participant count
  const data = trainings.map((training: Training) => ({
    ...training,
    participants: training.assignments?.length || 0,
    total_participants:
      training.assignments?.reduce((acc, assignment) => {
        if (assignment.completion_status === 'completed') {
          return acc + 1
        }
        return acc
      }, 0) || 0
  }))

  const fetchTrainings = async () => {
    try {
      logger.debug('Fetching trainings...')
      router.refresh()
      setTrainings(initialData)
      logger.debug('Trainings fetched successfully')
    } catch (error) {
      logger.error('Error fetching trainings', { error })
      toast.error('Failed to fetch trainings')
    }
  }

  const handleSuccess = async () => {
    toast.success('Training updated successfully')
    setOpen(false)
    await fetchTrainings()
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
            Training Management
          </h1>
          <p className='text-muted-foreground'>
            Manage training sessions and participants
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 size-4' />
              Create Training
            </Button>
          </DialogTrigger>
          <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Create New Training</DialogTitle>
            </DialogHeader>
            <TrainingForm
              onSuccess={handleSuccess}
              closeDialog={() => setOpen(false)}
              availableUsers={availableUsers}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={data}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </div>
  )
}
