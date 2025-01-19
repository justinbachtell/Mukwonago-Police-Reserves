'use client'

import { getTrainings } from '@/actions/training'
import { TrainingManagementTable } from '@/components/admin/training/TrainingManagementTable'
import type { Training } from '@/types/training'
import type { DBUser } from '@/types/user'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { TrainingForm } from '@/components/admin/training/TrainingForm'
import { Plus, GraduationCap } from 'lucide-react'
import { toISOString } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllUsers } from '@/actions/user'

export default function AdminTrainingPage() {
  const [open, setOpen] = useState(false)
  const [trainings, setTrainings] = useState<Training[]>([])
  const [availableUsers, setAvailableUsers] = useState<DBUser[]>([])

  const fetchData = async () => {
    const [rawTrainings, users] = await Promise.all([
      getTrainings(),
      getAllUsers()
    ])

    const formattedTrainings: Training[] = (rawTrainings ?? []).map(
      training => ({
        ...training,
        created_at: toISOString(new Date(training.created_at)),
        training_date: toISOString(new Date(training.training_date)),
        training_end_time: toISOString(new Date(training.training_end_time)),
        training_start_time: toISOString(
          new Date(training.training_start_time)
        ),
        updated_at: toISOString(new Date(training.updated_at)),
        training_type: training.training_type as Training['training_type'],
        assignments: training.assignments?.map(assignment => ({
          ...assignment,
          completion_status: assignment.completion_status || null,
          completion_notes: assignment.completion_notes || null,
          created_at: toISOString(new Date(assignment.created_at)),
          updated_at: toISOString(new Date(assignment.updated_at))
        }))
      })
    )
    setTrainings(formattedTrainings)
    setAvailableUsers(users ?? [])
  }

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

  // Calculate training statistics
  const now = new Date()
  const upcomingTrainings = trainings.filter(
    training => new Date(training.training_date) > now
  ).length
  const pastTrainings = trainings.filter(
    training => new Date(training.training_date) <= now
  ).length
  const totalAssignments = trainings.reduce(
    (acc, training) => acc + (training.assignments?.length || 0),
    0
  )
  const completedAssignments = trainings.reduce(
    (acc, training) =>
      acc +
      (training.assignments?.filter(a => a.completion_status === 'completed')
        ?.length || 0),
    0
  )
  const assignmentCompletionRate =
    totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0

  return (
    <div className='container relative mx-auto min-h-screen overflow-hidden px-4 pt-4 md:px-6 lg:px-10'>
      {/* Stats Card */}
      <Card className='mb-8 bg-white/80 shadow-md dark:bg-white/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <GraduationCap className='size-5 text-blue-500' />
            Training Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-5'>
          <div>
            <p className='text-sm text-muted-foreground'>Total Trainings</p>
            <p className='mt-1 text-2xl font-bold'>{trainings.length}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Upcoming Trainings</p>
            <p className='mt-1 text-2xl font-bold'>{upcomingTrainings}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Past Trainings</p>
            <p className='mt-1 text-2xl font-bold'>{pastTrainings}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Total Assignments</p>
            <p className='mt-1 text-2xl font-bold'>{totalAssignments}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Completion Rate</p>
            <p className='mt-1 text-2xl font-bold'>
              {assignmentCompletionRate}%
            </p>
          </div>
        </CardContent>
      </Card>

      <div className='mb-6 flex flex-col items-center justify-between gap-4 md:flex-row'>
        <div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Training Management
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Create and manage training sessions for reserve officers.
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
              closeDialog={() => setOpen(false)}
              onSuccess={() => {
                setOpen(false)
                // Refetch trainings after successful creation
                fetchData()
              }}
              availableUsers={availableUsers}
            />
          </DialogContent>
        </Dialog>
      </div>

      <TrainingManagementTable
        data={trainings}
        availableUsers={availableUsers}
      />
    </div>
  )
}
