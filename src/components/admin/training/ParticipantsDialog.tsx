'use client'

import type { Training } from '@/types/training'
import type { CompletionStatus } from '@/types/trainingAssignment'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateTrainingAssignmentStatus } from '@/actions/trainingAssignment'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/client'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

const logger = createLogger({
  module: 'training',
  file: 'ParticipantsDialog.tsx'
})

interface ParticipantsDialogProps {
  training: Training
}

export function ParticipantsDialog({ training }: ParticipantsDialogProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createClient()

  logger.time('participants-dialog-render')

  useEffect(() => {
    const checkSession = async () => {
      logger.info('Checking auth session', undefined, 'checkSession')
      try {
        const {
          data: { session: currentSession }
        } = await supabase.auth.getSession()
        setSession(currentSession)
      } catch (error) {
        logger.error(
          'Failed to check auth session',
          logger.errorWithData(error),
          'checkSession'
        )
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [supabase.auth])

  const handleCompletionStatusChange = async (
    userId: string,
    status: CompletionStatus | null,
    notes: string | null = null
  ) => {
    logger.info(
      'Updating completion status',
      { userId, status, hasNotes: !!notes },
      'handleCompletionStatusChange'
    )
    logger.time(`update-status-${userId}`)

    try {
      if (!session) {
        logger.warn(
          'Update attempted without auth',
          undefined,
          'handleCompletionStatusChange'
        )
        toast.error('You must be logged in to update completion status')
        return
      }

      const result = await updateTrainingAssignmentStatus(training.id, userId, {
        completion_notes: notes,
        completion_status: status === null ? 'incomplete' : status
      })

      if (result) {
        logger.info(
          'Status updated successfully',
          { userId, newStatus: result.completion_status },
          'handleCompletionStatusChange'
        )
        toast.success('Training completion status updated')
      }
    } catch (error) {
      logger.error(
        'Failed to update completion status',
        logger.errorWithData(error),
        'handleCompletionStatusChange'
      )
      toast.error('Failed to update completion status')
    } finally {
      logger.timeEnd(`update-status-${userId}`)
    }
  }

  try {
    if (isLoading) {
      return <div className='p-4 text-center'>Loading...</div>
    }

    if (!training.assignments?.length) {
      logger.info(
        'No participants found',
        { trainingId: training.id },
        'render'
      )
      return (
        <div className='p-4 text-center text-muted-foreground'>
          No participants assigned to this training
        </div>
      )
    }

    return (
      <div className='space-y-4 py-4'>
        {training.assignments.map(assignment => {
          if (!assignment.user) {
            logger.warn(
              'Assignment found without user',
              { assignmentId: assignment.id },
              'render'
            )
            return null
          }

          return (
            <div
              key={assignment.user_id}
              className='flex flex-col gap-4 rounded-lg border p-4'
            >
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <p className='font-medium'>
                    {assignment.user.first_name} {assignment.user.last_name}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {assignment.user.email}
                  </p>
                </div>

                <div className='flex items-center gap-2'>
                  <Label htmlFor={`status-${assignment.user_id}`}>Status</Label>
                  <select
                    id={`status-${assignment.user_id}`}
                    className={cn(
                      'h-9 w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                    )}
                    value={assignment.completion_status || ''}
                    onChange={e =>
                      handleCompletionStatusChange(
                        assignment.user_id,
                        e.target.value as CompletionStatus | null,
                        assignment.completion_notes
                      )
                    }
                    aria-label={`Completion status for ${assignment.user.first_name} ${assignment.user.last_name}`}
                  >
                    <option value=''>Select status</option>
                    <option value='completed'>Completed</option>
                    <option value='incomplete'>Incomplete</option>
                    <option value='excused'>Excused</option>
                    <option value='unexcused'>Unexcused</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor={`notes-${assignment.user_id}`}>Notes</Label>
                <Textarea
                  id={`notes-${assignment.user_id}`}
                  placeholder='Add notes about completion status'
                  value={assignment.completion_notes || ''}
                  onChange={e =>
                    handleCompletionStatusChange(
                      assignment.user_id,
                      assignment.completion_status,
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  } catch (error) {
    logger.error(
      'Error rendering participants dialog',
      logger.errorWithData(error),
      'render'
    )
    throw error
  } finally {
    logger.timeEnd('participants-dialog-render')
  }
}
