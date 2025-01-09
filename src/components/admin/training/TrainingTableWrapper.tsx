'use client'

import type { Training } from '@/types/training'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/app/(auth)/admin/training/columns'
import { useState } from 'react'
import type { SortingState } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { TrainingForm } from '@/components/admin/forms/TrainingForm'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface TrainingTableWrapperProps {
  initialData: Training[]
}

export function TrainingTableWrapper({
  initialData
}: TrainingTableWrapperProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'training_date', desc: true }
  ])
  const router = useRouter()

  // Transform the data to include participant count
  const data = initialData.map((training: Training) => ({
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

  const handleSuccess = () => {
    toast.success('Training updated successfully')
    router.refresh()
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

        <Dialog>
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
            <TrainingForm onSuccess={handleSuccess} />
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
